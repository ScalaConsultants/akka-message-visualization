'use strict';

define([
  'GraphAction'
], function(GraphAction) {

function logDo(description)   { console.log("Perform: " + description); }
function logUndo(description) { console.log("Undo: " + description); }
function generateRandomId()   { return Math.random().toString(36).substr(2); }

function createActorActionConfiguration() {
  var node        = this.logData().createNode();
  var description = this.logData().time() + ": Created node: " + node.id;
  var state       = this.state();

  this.setForward(function() {
    logDo(description);
    state.addNode(node);
  });

  this.setBackward(function() {
    logUndo(description);
    state.removeNode(node);
  });
}

function messageReceivedActionConfiguration() {
  var logData   = this.logData();
  var state     = this.state();
  var receiver  = logData.createNode();
  var messageId = logData.createMessageId();
  var edgeLabel = logData.createMessageLabel();

  function containsSender(j) { return j.containsSender(); }

  var currentNodes = state.currentNodes();
  function currentlyExists(j) { return currentNodes.indexOf(j.createNode().id) >= 0; }

  function containsMessage(j) { return j.containsMessage(); }

  function sameMessageId(j) { return messageId === j.createMessageId(); }

  var logData2 = state.timeline().filter(containsSender).
                                  filter(currentlyExists).
                                  filter(containsMessage).
                                  filter(sameMessageId)[0];

  var sender      = null;
  var description = null;
  var confirmedId = null;
  var incomplete  = null;
  if (logData2 != null) {
    var currentEdges = state.currentEdges();
    function currentlyUsed(obj) { return currentEdges.indexOf(obj.inner) >= 0; }
    function sameOuterMessageId(obj) { return messageId === obj.outer; }
    var unconfirmedMessagesOfId = state.unconfirmed().filter(currentlyUsed).filter(sameOuterMessageId);

    sender      = logData2.createNode();
    description = logData.time() + ": Received message from :" + sender.id + " to: " + receiver.id;
    if (unconfirmedMessagesOfId[0] != null)
      confirmedId = unconfirmedMessagesOfId.shift();
    incomplete  = false;
  } else {
    sender = {
      id:    generateRandomId(),
      label: "unknown sender"
    };
    description = logData.time() + ": Received message to: " + receiver.id;
    confirmedId = { inner: generateRandomId(), outer: messageId };
    incomplete  = true;
  }

  if (confirmedId == null) {
    console.error("Couldn't find edge to update");
    this.setForward(function() {});
    this.setBackward(function() {});
    return;
  }

  var that = this;
  this.setForward(function() {
    logDo(description);
    if (incomplete) {
      state.addNode(sender);
      state.addEdge({
        id:    confirmedId.inner,
        from:  sender.id,
        to:    receiver.id,
        label: edgeLabel,
        color: "green"
      });
    } else {
      state.confirm(confirmedId);
      state.updateEdge(confirmedId.inner, { color: "green" });
    }
  });

  this.setBackward(function() {
    logUndo(description);
    if (incomplete) {
      state.removeEdge({ id: confirmedId.inner });
      state.removeNode(sender);
    } else {
      state.updateEdge(confirmedId.inner, { color: "red" });
      state.addUnconfirmed(confirmedId);
    }
  });

  var confirmedMessageRemovalAction = new GraphAction(state, logData).setConfigureActions(removeConfirmedMessage);
  confirmedMessageRemovalAction.meta().sender      = sender;
  confirmedMessageRemovalAction.meta().receiver    = receiver;
  confirmedMessageRemovalAction.meta().confirmedId = confirmedId;
  confirmedMessageRemovalAction.meta().incomplete  = incomplete;
  state.enqueForward(confirmedMessageRemovalAction);
}

function removeConfirmedMessage() {
  var logData     = this.logData();
  var state       = this.state();
  var messageId   = logData.createMessageId();
  var edgeLabel   = logData.createMessageLabel();
  var sender      = this.meta().sender;
  var receiver    = this.meta().receiver;
  var confirmedId = this.meta().confirmedId;
  var incomplete  = this.meta().incomplete;
  var description = incomplete ?
    (logData.time() + ": Removing confirmed message to: " + receiver.id) :
    (logData.time() + ": Removing confirmed message from :" + sender.id + " to: " + receiver.id);

  this.setForward(function() {
    logDo(description);
    state.removeEdge({ id: confirmedId.inner });
    if (incomplete)
      state.removeNode(sender);
  });

  this.setBackward(function() {
    logUndo(description);
    if (incomplete)
      state.addNode(sender);
    state.addEdge({
      id:    confirmedId.inner,
      from:  sender.id,
      to:    receiver.id,
      label: edgeLabel,
      color: 'green'
    });
  });
}

function messageSentActionConfiguration() {
  var logData     = this.logData();
  var state       = this.state();
  var sender      = logData.createNode();
  var messageId   = logData.createMessageId();
  var edgeLabel   = logData.createMessageLabel();
  var innerId     = generateRandomId();
  var unconfirmed = { inner: innerId, outer: messageId };

  function containsReceiver(j) { return j.containsReceiver(); }

  var currentNodes = state.currentNodes();
  function currentlyExists(j) { return currentNodes.indexOf(j.createNode().id) >= 0; }

  function containsMessage(j) { return j.containsMessage(); }

  function sameMessageId(j) { return messageId === j.createMessageId(); }


  var logData2 = state.timeline().filter(containsReceiver).
                                  filter(currentlyExists).
                                  filter(containsMessage).
                                  filter(sameMessageId)[0];

  var receiver    = null;
  var description = null;
  var incomplete  = null;

  if (logData2 != null) {
    receiver    = logData2.createNode();
    description = logData.time() + ": Sending message from :" + sender.id + " to: " + receiver.id;
    incomplete  = false;
  } else {
    receiver    = {
      id:    generateRandomId(),
      label: "unknown receiver"
    };
    description = logData.time() + ": Sending message from :" + sender.id;
    incomplete  = true;
  }

  this.setForward(function() {
    logDo(description);
    if (incomplete)
      state.addNode(receiver);
    state.addEdge({
      id:    innerId,
      from:  sender.id,
      to:    receiver.id,
      label: edgeLabel,
      color: 'red'
    });
    state.addUnconfirmed(unconfirmed);
  });

  this.setBackward(function() {
    logUndo(description);
    state.removeEdge({ id: innerId });
    if (incomplete)
      removeNode(receiver);
    state.confirm(unconfirmed);
  });
}

function actorStoppedActionConfiguration() {
  var node        = this.logData().createNode();
  var description = this.logData().time() + ": Stopped node: " + node.id;
  var state       = this.state();

  this.setForward(function() {
    logDo(description);
    state.removeNode(node);
  });

  this.setBackward(function() {
    logUndo(description);
    state.addNode(node);
  });
}

return {
  createActor:     createActorActionConfiguration,
  messageReceived: messageReceivedActionConfiguration,
  messageSent:     messageSentActionConfiguration,
  actorStopped:    actorStoppedActionConfiguration
};
});

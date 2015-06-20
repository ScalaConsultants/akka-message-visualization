'use strict';

function logDo(description)   { console.log("Perform: " + description); }
function logUndo(description) { console.log("Undo: " + description); }

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

  function containsSender(j) { return j.containsSender(); }

  var currentNodes = state.currentNodes();
  function currentlyExists(j) { return currentNodes.indexOf(j.createNode().id) >= 0; }

  function containsMessage(j) { return j.containsMessage(); }

  function sameMessageId(j) { return messageId === j.createMessageId(); }

  var logData2 = state.timeline().filter(containsSender).
                                  filter(currentlyExists).
                                  filter(containsMessage).
                                  filter(sameMessageId)[0];
  if (logData2 == null) {
    console.error("Receiver " + receiver.id + "couldn't be matched with a sender for " + messageId);
    return;
  }

  var currentEdges = state.currentEdges();
  function currentlyUsed(obj) { return currentEdges.indexOf(obj.inner) >= 0; }

  function sameOuterMessageId(obj) { return messageId === obj.outer; }

  var unconfirmedMessagesOfId = state.unconfirmed().filter(currentlyUsed).filter(sameOuterMessageId);
  if (unconfirmedMessagesOfId[0] != null) {
    var sender      = logData2.createNode();
    var description = logData.time() + ": Received message from :" + sender.id + " to: " + receiver.id;
    var confirmedId = unconfirmedMessagesOfId.shift();

    var that = this;
    this.setForward(function() {
      logDo(description);
      state.confirm(confirmedId);
      state.updateEdge(confirmedId.inner, { color: "green" });
    });

    this.setBackward(function() {
      logUndo(description);
      state.addUnconfirmed(confirmedId);
      state.updateEdge(confirmedId.inner, { color: "red" });
    });

    var confirmedMessageRemovalAction = new GraphAction(state, logData).setConfigureActions(removeConfirmedMessage);
    confirmedMessageRemovalAction.meta().sender      = sender;
    confirmedMessageRemovalAction.meta().receiver    = receiver;
    state.enqueForward(confirmedMessageRemovalAction);
    confirmedMessageRemovalAction.meta().confirmedId = confirmedId;
  } else {
    console.error("Couldn't match received message " + messageId);
  }
}

function removeConfirmedMessage() {
  var logData     = this.logData();
  var state       = this.state();
  var messageId   = logData.createMessageId();
  var sender      = this.meta().sender;
  var receiver    = this.meta().receiver;
  var confirmedId = this.meta().confirmedId;
  var description = logData.time() + ": Removing confirmed message from :" + sender.id + " to: " + receiver.id;

  this.setForward(function() {
    logDo(description);
    state.removeEdge({ id: confirmedId.inner });
  });

  this.setBackward(function() {
    logUndo(description);
    state.addEdge({
      id:    innerId,
      from:  sender.id,
      to:    receiver.id,
      label: messageId,
      color: 'green'
    });
  });
}

function messageSentActionConfiguration() {
  var logData   = this.logData();
  var state     = this.state();
  var sender    = logData.createNode();
  var messageId = logData.createMessageId();

  function containsReceiver(j) { return j.containsReceiver(); }

  var currentNodes = state.currentNodes();
  function currentlyExists(j) { return currentNodes.indexOf(j.createNode().id) >= 0; }

  function containsMessage(j) { return j.containsMessage(); }

  function sameMessageId(j) { return messageId === j.createMessageId(); }

  var logData2 = state.timeline().filter(containsReceiver).
                                  filter(currentlyExists).
                                  filter(containsMessage).
                                  filter(sameMessageId)[0];
  if (logData2 == null) {
    console.error("Sender " + sender.id + " couldn't be matched with a receiver for " + messageId);
    return;
  }

  var receiver    = logData2.createNode();
  var description = logData.time() + ": Sending message from :" + sender.id + " to: " + receiver.id;
  var innerId     = Math.random().toString(36).substr(2);
  var unconfirmed = { inner: innerId, outer: messageId };

  this.setForward(function() {
    logDo(description);
    state.addEdge({
      id:    innerId,
      from:  sender.id,
      to:    receiver.id,
      label: messageId,
      color: 'red'
    });
    state.addUnconfirmed(unconfirmed);
  });

  this.setBackward(function() {
    logUndo(description);
    state.removeEdge({ id: innerId });
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
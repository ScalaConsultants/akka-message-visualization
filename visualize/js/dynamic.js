'use strict';

var animationStepMs = 500;

var timeline;

var container;
var data;
var options;
var network;

var actionQueue;

var unconfirmed;

function actorCreatedAction(json) {
  return function() {
    var node = createNodeFromJSON(json);
    console.log(json.time + ": Created node: " + node.id);
    data.nodes.add(node);
  };
}

function messageReceivedAction(json) {
  return function() {
    var receiver  = createNodeFromJSON(json);
    var messageId = createMessageId(json);

    // message with the same hash might be sent across several runtimes
    var alive = data.nodes.getIds();
    function currentlyAlive(j) { return alive.indexOf(createNodeFromJSON(j).id) >= 0; }

    function sameMessageId(j) { return messageId === createMessageId(j); }

    var json2 = timeline.filter(containsSender).
                         filter(currentlyAlive).
                         filter(containsMessage).
                         filter(sameMessageId)[0];
    if (json2 != null) {
      function sameOuterMessageId(obj) { return messageId === obj.outer; }
      var unconfirmedMessagesOfId = unconfirmed.filter(sameOuterMessageId);
      if (unconfirmedMessagesOfId[0] != null) {
        var sender = createNodeFromJSON(json2);
        console.log(json.time + ": Received message from :" + sender.id + " to: " + receiver.id);
        var confirmedId = unconfirmedMessagesOfId.shift();
        // TODO: change arrow to green
        actionQueue.unshift(function() { data.edges.remove({ id: confirmedId.inner }); });
      }
    }
  };
}

function messageSentAction(json) {
  return function() {
    var sender    = createNodeFromJSON(json);
    var messageId = createMessageId(json);

    // message with the same hash might be sent across several runtimes
    var alive = data.nodes.getIds();
    function currentlyAlive(j) { return alive.indexOf(createNodeFromJSON(j).id) >= 0; }

    function sameMessageId(j) { return messageId === createMessageId(j); }

    var json2 = timeline.filter(containsReceiver).
                         filter(currentlyAlive).
                         filter(containsMessage).
                         filter(sameMessageId)[0];
    if (json2 != null) {
      var receiver = createNodeFromJSON(json2);
      console.log(json.time + ": Sending message from :" + sender.id + " to: " + receiver.id);
      var innerId = data.edges.add({
        from:  sender.id,
        to:    receiver.id,
        label: messageId,
        color: 'red'
      });
      unconfirmed.push({ inner: innerId[0], outer: messageId });
    }
  };
}

function actorStoppedAction(json) {
  return function() {
    var node = createNodeFromJSON(json);
    console.log(json.time + ": Stopped node: " + node.id);
    data.nodes.remove({ id: node.id });
  };
}

function jsonToAction(json) {
  if (containsCreated(json))    return actorCreatedAction(json);
  if (containsMessage(json)) {
    if (containsReceiver(json)) return messageReceivedAction(json);
    if (containsSender(json))   return messageSentAction(json);
  }
  if (containsStopped)          return actorStoppedAction(json);
  return null;
}

function initiateGraph() {
  container = document.getElementById(graphElementDOMId);
  data      = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) };
  options   = {
    edges: {
      arrows: {
        to: true
      }
    }
  };
  network   = new vis.Network(container, data, options);
  unconfirmed = [];
}

function prepareData(data) {
  timeline = data.filter(containsTime);
  return timeline.map(jsonToAction).filter(notNull);
}

function runEnqueuedAction() {
  if (actionQueue[0] != null)
    try {
      (actionQueue.shift())();
    } catch (e) {
      console.error(e);
    }
  if (actionQueue[0] != null)
    setTimeout(runEnqueuedAction, animationStepMs);
}

function drawGraph(jsonData) {
  initiateGraph();
  actionQueue = prepareData(jsonData);
  runEnqueuedAction();
}

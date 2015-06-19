'use strict';

var timeline;

var container;
var data;
var options;
var network;

var actionQueue;

var confirmed;

function actorCreatedAction(json) {
  return function() {
    var node = createNodeFromJSON(json);
    console.log(json.time + ": Created node: " + node.id);
    data.nodes.add(node);
  };
}

function messageReceivedAction(json) {
  return function() {};
}

function messageSentAction(json) {
  return function() {
    var sender    = createNodeFromJSON(json);
    var messageId = createId(json.message_class, json.message_hash);

    // message with the same hash might be sent across several runtimes
    var alive = data.nodes.getIds();
    function currentlyAlive(json) {
      var receiver = createNodeFromJSON(json);
      return alive.indexOf(receiver.id) >= 0;
    }

    function sameMessageId(json2) {
      var messageId2 = createId(json2.message_class, json2.message_hash);
      return messageId === messageId2;
    }

    var json2 = timeline.filter(containsReceiver).
                         filter(currentlyAlive).
                         filter(containsMessage).
                         filter(sameMessageId)[0];
    if (json2 != null) {
      var receiver = createNodeFromJSON(json2);
      console.log(json.time + ": Sending message from :" + sender.id + " to: " + receiver.id);
      data.edges.add({
        from:  sender.id,
        to:    receiver.id,
        label: json.message_class,
        color: 'red'
      });
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
    setTimeout(runEnqueuedAction, 1000);
}

function drawGraph(jsonData) {
  initiateGraph();
  actionQueue = prepareData(jsonData);
  runEnqueuedAction()
}

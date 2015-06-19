"use strict";

function containsMessage(json) {
  return json.hasOwnProperty('message_class') && json.hasOwnProperty('message_hash');
}

function containsReceiver(json) {
  return json.hasOwnProperty('receiver_class') && json.hasOwnProperty('receiver_hash');
}

function containsSender(json) {
  return json.hasOwnProperty('sender_class') && json.hasOwnProperty('sender_hash');
}

function createNodeFromJSON(json) {
  var node_id    = null;
  var node_label = null;

  if (containsReceiver(json)) {
    var node_id    = json.receiver_class + '(' + json.receiver_hash + ')';
    var node_label = json.receiver_class;
  }

  else if (containsSender) {
    var node_id    = json.sender_class+ '(' + json.sender_hash + ')';
    var node_label = json.sender_class;
  }

  return (node_id && node_label) ? { id: node_id, label: node_label } : null;
}

function prepareData(data) {
  var nodes_data = data.map(createNodeFromJSON).filter(idUniquenessFilter);
  var edges_data = [];

  // remove error
  var messageTransfer = data.filter(containsMessage);
  var sendingList     = messageTransfer.filter(containsSender);
  var receivingList   = messageTransfer.filter(containsReceiver);
  var senders         = messageTransfer.filter(containsSender).map(createNodeFromJSON).filter(idUniquenessFilter);
  var receivers       = messageTransfer.filter(containsReceiver).map(createNodeFromJSON).filter(idUniquenessFilter);
  for (var sid in sendingList) {
    var sending       = sendingList[sid];
    var sentMessageId = sending.message_class + '(' + sending.message_hash + ')';
    var sender        = createNodeFromJSON(sending);
    for (var rid in receivingList) {
      var receiving         = receivingList[rid];
      var receiver          = createNodeFromJSON(receiving);
      var receivedMessageId = receiving.message_class + '(' + receiving.message_hash + ')';

      if (sentMessageId === receivedMessageId)
        edges_data.push({from: sender.id, to: receiver.id});
    }
  }

  return { nodes: new vis.DataSet(nodes_data),
           edges: new vis.DataSet(edges_data) };
}

function drawGraph(jsonData) {
  var container = document.getElementById('messages-graph');
  var data      = prepareData(jsonData);
  var options   = {};
  var network   = new vis.Network(container, data, options);
}

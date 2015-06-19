'use strict';

var defaultOptions = {
  edges: {
    arrows: {
      to: true
    }
  }
};

function prepareData(data) {
  var nodes_data = data.map(createNodeFromJSON).filter(notNull).filter(idUniquenessFilter);
  var edges_data = [];

  var messageTransfer = data.filter(containsMessage);
  var sendingList     = messageTransfer.filter(containsSender);
  var receivingList   = messageTransfer.filter(containsReceiver);
  var senders         = messageTransfer.filter(containsSender).map(createNodeFromJSON).filter(idUniquenessFilter);
  var receivers       = messageTransfer.filter(containsReceiver).map(createNodeFromJSON).filter(idUniquenessFilter);
  for (var sid in sendingList) {
    var sending       = sendingList[sid];
    var sender        = createNodeFromJSON(sending);
    var sentMessageId = createId(sending.message_class, sending.message_hash);
    for (var rid in receivingList) {
      var receiving         = receivingList[rid];
      var receiver          = createNodeFromJSON(receiving);
      var receivedMessageId = createId(receiving.message_class, receiving.message_hash);

      if (sentMessageId === receivedMessageId)
        edges_data.push({ from: sender.id, to: receiver.id, label: receiving.message_class });
    }
  }

  return { nodes: new vis.DataSet(nodes_data),
           edges: new vis.DataSet(edges_data) };
}

function drawGraph(jsonData) {
  var container = document.getElementById(graphElementDOMId);
  var data      = prepareData(jsonData);
  var options   = defaultOptions;
  var network   = new vis.Network(container, data, options);
}

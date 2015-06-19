'use strict';

var createdClassField  = 'created_class';
var createdHashField   = 'created_hash';
var messageClassField  = 'message_class';
var messageHashField   = 'message_hash';
var receiverClassField = 'receiver_class';
var receiverHashField  = 'receiver_hash';
var senderClassField   = 'sender_class';
var senderHashField    = 'sender_hash';
var stoppedClassField  = 'stopped_class';
var stoppedHashField   = 'stopped_hash';
var timeField          = 'time';
var graphElementDOMId  = 'messages-graph';

function containsCreated(json) {
  return json.hasOwnProperty(createdClassField) && json.hasOwnProperty(createdHashField);
}

function containsMessage(json) {
  return json.hasOwnProperty(messageClassField) && json.hasOwnProperty(messageHashField);
}

function containsReceiver(json) {
  return json.hasOwnProperty(receiverClassField) && json.hasOwnProperty(receiverHashField);
}

function containsSender(json) {
  return json.hasOwnProperty(senderClassField) && json.hasOwnProperty(senderHashField);
}

function containsStopped(json) {
  return json.hasOwnProperty(stoppedClassField) && json.hasOwnProperty(stoppedHashField);
}

function containsTime(json) {
  return json.hasOwnProperty(timeField);
}

function createId(clas, hash) { return clas + '(' + hash + ')'; }

function createLabel(clas, hash) { return clas; }

function createNodeFromJSON(json) {
  var clas = null;
  var hash = null;

  if (containsCreated(json)) {
    clas = json.created_class;
    hash = json.created_hash;
  }

  else if (containsReceiver(json)) {
    clas = json.receiver_class;
    hash = json.receiver_hash;
  }

  else if (containsSender) {
    clas = json.sender_class;
    hash = json.sender_hash;
  }

  if (containsStopped(json)) {
    clas = json.stopped_class;
    hash = json.stopped_hash;
  }

  return (clas && hash) ? { id: createId(clas, hash), label: createLabel(clas, hash) } : null;
}

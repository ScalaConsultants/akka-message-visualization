'use strict';

define([
  'JsonLogFetcher'
], function(JsonLogFetcher) {

console.log("LogData module loaded");

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
var transmissionField  = 'transmission';

function LogData(json) {
  this._json = json;
}

LogData.prototype.json = function() { return this._json; }

LogData.prototype.time = function() { return this.containsTime() ? this._json[timeField] : "uknown time"; }

LogData.prototype.containsCreated = function() {
  return this._json.hasOwnProperty(createdClassField) && this._json.hasOwnProperty(createdHashField);
}

LogData.prototype.containsMessage = function() {
  return this._json.hasOwnProperty(messageClassField) && this._json.hasOwnProperty(messageHashField);
}

LogData.prototype.containsReceiver = function() {
  return this._json.hasOwnProperty(receiverClassField) && this._json.hasOwnProperty(receiverHashField);
}

LogData.prototype.containsSender = function() {
  return this._json.hasOwnProperty(senderClassField) && this._json.hasOwnProperty(senderHashField);
}

LogData.prototype.containsStopped = function() {
  return this._json.hasOwnProperty(stoppedClassField) && this._json.hasOwnProperty(stoppedHashField);
}
LogData.prototype.containsTime = function() {
  return this._json.hasOwnProperty(timeField);
}
LogData.prototype.containsTransmission = function() {
  return this._json.hasOwnProperty(transmissionField);
}

LogData.prototype.createMessageId = function() {
  return this.containsTransmission() ? this._json[transmissionField] : null;
}

LogData.prototype.createMessageLabel = function() {
  return this.containsMessage() ? this._createId(this._json[messageClassField], this._json[messageHashField]) : null;
}

LogData.prototype.createNode = function() {
  var clas = null;
  var hash = null;

  if (this.containsCreated()) {
    clas = this._json[createdClassField];
    hash = this._json[createdHashField];
  }

  else if (this.containsReceiver()) {
    clas = this._json[receiverClassField];
    hash = this._json[receiverHashField];
  }

  else if (this.containsSender()) {
    clas = this._json[senderClassField];
    hash = this._json[senderHashField];
  }

  if (this.containsStopped()) {
    clas = this._json[stoppedClassField];
    hash = this._json[stoppedHashField];
  }

  var that = this;
  return (clas && hash) ? { id: that._createId(clas, hash), label: that._createId(clas, hash) } : null;
}

LogData.prototype._createId = function(clas, hash) { return clas + '(' + hash + ')'; }

return LogData;
});


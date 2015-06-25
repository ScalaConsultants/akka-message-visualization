'use strict';

define([
  'vis',
  'utils'
], function(vis, utils) {

console.log("GraphState module loaded");

function GraphState(logDataTimeline, graphElementDomId) {
  this._timeline  = logDataTimeline; // log in form of sorted list of LogData objects

  this._container = document.getElementById(graphElementDomId);
  this._data      = this._initializeData(logDataTimeline);
  this._options   = {
    edges: {
      arrows: {
        to: true
      }
    }
  };
  this._network   = new vis.Network(this._container, this._data, this._options);

  this._unconfirmed = [];   // list of { inner: "random id", outer: "generated by logData.messageId()" }

  this._forwardQueue  = []; // LIFO queue
  this._backwardQueue = []; // LIFO queue
}

GraphState.prototype.destroy        = function() { this._network.destroy(); }

GraphState.prototype.timeline       = function() { return this._timeline; }

GraphState.prototype.addEdge        = function(edge) { return this._data.edges.add(edge); }
GraphState.prototype.removeEdge     = function(edge) { this._data.edges.remove(edge); }
GraphState.prototype.currentEdges   = function() { return this._data.edges.getIds(); }
GraphState.prototype.updateEdge     = function(id, updatedProperties) {
  var updateObj = JSON.parse(JSON.stringify(updatedProperties));
  updateObj.id = id;
  this._data.edges.update(updateObj);
}

GraphState.prototype.addNode        = function(node) { return this._data.nodes.add(node); }
GraphState.prototype.removeNode     = function(node) { this._data.nodes.remove(node); }
GraphState.prototype.currentNodes   = function() { return this._data.nodes.getIds(); }
GraphState.prototype.updateNode     = function(id, updatedProperties) {
  var updateObj = JSON.parse(JSON.stringify(updatedProperties));
  updateObj.id = id;
  this._data.nodes.update(updateObj);
}

GraphState.prototype.confirm        = function(idPair) { if (idPair != null) utils.remove(this._unconfirmed, idPair); }
GraphState.prototype.addUnconfirmed = function(idPair) { if (idPair != null) this._unconfirmed.push(idPair); }
GraphState.prototype.unconfirmed    = function() { return this._unconfirmed; }

GraphState.prototype.canForward     = function() { return this._forwardQueue.length > 0; }
GraphState.prototype.enqueForward   = function(action) { this._forwardQueue.push(action); }
GraphState.prototype.dequeForward   = function() { return this._forwardQueue.pop(); }
GraphState.prototype.getForward     = function() {
  return this.canForward() ? this._forwardQueue[this._forwardQueue.length - 1] : null;
}
GraphState.prototype.moveForward    = function() {
  if (this.canForward()) {
    var action = this.dequeForward();
    action.actForward();
    this.enqueBackward(action);
  }
}

GraphState.prototype.canBackward    = function() { return this._backwardQueue.length > 0; }
GraphState.prototype.dequeBackward  = function() { return this._backwardQueue.pop(); }
GraphState.prototype.enqueBackward  = function(action) { this._backwardQueue.push(action); }
GraphState.prototype.getBackward    = function() {
  return this.canBackward() ? this._backwardQueue[this._backwardQueue.length - 1] : null;
}
GraphState.prototype.moveBackward   = function() {
  if (this.canBackward()) {
    var action = this.dequeBackward();
    action.actBackward();
  // TODO: handle received without send event
    this.enqueForward(action);
  }
}

GraphState.prototype._initializeData = function (timeline) {
  function containsCreated(logData) { return logData.containsCreated(); }
  function toNode(logData) { return logData.createNode(); }
  var created = timeline.filter(containsCreated).map(toNode).filter(utils.notNull);

  function notCreated(logData, index, array) {
    var actor = logData.createNode();
    function sameObj(actor2) { return actor.id == actor2.id; }
    function sameObj(actor2) { return actor.id == actor2.id; }
    return (actor == null || created.filter(sameObj).length > 0) ? null : actor;
  }
  function uniqueness(actor, index, array) {
    function sameActor(actor2) { return JSON.stringify(actor) == JSON.stringify(actor2); }
    return array.filter(sameActor)[0] == actor;
  }
  var nodes = timeline.map(notCreated).filter(utils.notNull).filter(uniqueness);

  var edges = [];

  return { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
}

return GraphState;
});


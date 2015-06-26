'use strict';

define([
  'utils',
  'LogData',
  'GraphFactory'
], function(utils, LogData, GraphFactory) {

console.log("GraphController module loaded");

function GraphController(config, fetcher) {
  this._config  = config;
  this._fetcher = fetcher;
  this._factory = null;
  this._state   = null;
}

GraphController.prototype.timeline     = function() { return (this._state != null) ? this._state.timeline() : null; }

GraphController.prototype.startAnew    = function(graphStartedCallback) {
  if (this._state != null)
    this._state.destroy();
  this._startGraph(graphStartedCallback);
}

GraphController.prototype.canForward   = function() { return this._state != null && this._state.canForward(); }
GraphController.prototype.canBackward  = function() { return this._state != null && this._state.canBackward(); }
GraphController.prototype.moveForward  = function(forwardedCallback) {
  if (this.canForward()) {
    var previous = this._state.getBackward();
    this._state.moveForward();
    var current  = this._state.getBackward();
    if (typeof (forwardedCallback) === "function")
      forwardedCallback(this, current, previous);
  }
}
GraphController.prototype.moveBackward = function(backwardedCallback) {
  if (this.canBackward()) {
    var previous = this._state.getBackward();
    this._state.moveBackward();
    var current  = this._state.getBackward();
    if (typeof (backwardedCallback) === "function")
      backwardedCallback(this, current, previous);
  }
}

GraphController.prototype._initiateFactoryAndGraph = function(jsonArray, graphStartedCallback) {
  console.log("Initializing GraphFactory");
  var timeline  = utils.logSort(jsonArray.map(function(json) { return new LogData(json); }));
  this._factory = new GraphFactory(timeline, this._config.getGraphId());
  this._initiateGraph(graphStartedCallback);
}

GraphController.prototype._initiateGraph = function(graphStartedCallback) {
  console.log("Creating new graph");
  this._state = this._factory.createGraph();
  if (typeof (graphStartedCallback) === "function")
    graphStartedCallback(this);
}

GraphController.prototype._startGraph = function(graphStartedCallback) {
  console.log("Attempt to initialize graph");
  var that = this;
  function onDataFetched(jsonArray) {
    console.log("Data fetched successfully");
    that._initiateFactoryAndGraph(jsonArray, graphStartedCallback);
  }
  this._fetcher.fetchData(onDataFetched);
}

return GraphController;
});

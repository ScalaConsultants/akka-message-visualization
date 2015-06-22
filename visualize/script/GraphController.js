'use strict';

define([
  'JsonLogFetcher',
  'LogData',
  'GraphFactory'
], function(JsonLogFetcher, LogData, GraphFactory) {

console.log("GraphController module loaded");

function GraphController(graphElementDomId, inputUrl) {
  this._graphElementDomId = graphElementDomId;
  this._inputUrl          = inputUrl;
  this._fetcher           = null;
  this._factory           = null;
  this._state             = null;
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

GraphController.prototype._fetchJsonLogThenInitializeFactoryAndGraph = function(graphStartedCallback) {
  if (this._fetcher == null) {
    console.log("No fetcher initialized - creating one now")
    this._fetcher = new JsonLogFetcher(this._inputUrl);
  }
  var that = this;
  function onDataFetched(jsonArray) {
    console.log("Data fetched successfully");
    that._initiateFactoryAndGraph(jsonArray, graphStartedCallback);
  }
  console.log("Ordering data fetch");
  this._fetcher.fetchData(onDataFetched);
}

GraphController.prototype._initiateFactoryAndGraph = function(jsonArray, graphStartedCallback) {
  console.log("Initializing GraphFactory");
  var timeline  = jsonArray.map(function(json) { return new LogData(json); });
  this._factory = new GraphFactory(timeline, this._graphElementDomId);
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
  if (this._factory == null) {
    console.log("GraphFactory not initialized - need to fetch data");
    this._fetchJsonLogThenInitializeFactoryAndGraph(graphStartedCallback);
  } else {
    console.log("GraphFactory initialized - passing control to GraphFactory");
    this._initiateGraph(graphStartedCallback);
  }
}

return GraphController;
});

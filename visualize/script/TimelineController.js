'use strict';

define([
  'utils',
  'vis',
  'LogData'
], function(utils, vis, LogData) {

console.log("TimelineController module loaded");

function TimelineController(config, fetcher) {
  this._config      = config;
  this._fetcher     = fetcher;
  this._timeline    = null;
  this._rawTimeline = null;
}

TimelineController.prototype.timeline = function() { return this._rawTimeline; }

TimelineController.prototype.startAnew = function(timelineStartedCallback) {
  if (this._timeline != null)
    this._timeline.destroy();
  this._startTimeline(timelineStartedCallback);
}

TimelineController.prototype._initiateTimeline = function(jsonArray, timelineStartedCallback) {
  console.log("Initializing Timeline");
  this._rawTimeline = jsonArray.map(function(json) { return new LogData(json); });
  var rawTimeline = this._rawTimeline;

  function pairActorCreationAndStopping(logData) {
    if (!logData.containsCreated())
      return null;
    var created = logData.createNode();
    function isPair(logData2) { return logData2.containsStopped() && logData2.createNode().id === created.id; }
    var pair = rawTimeline.filter(isPair)[0];
    return (pair != null) ? { content: "Actor: "+created.id, start: logData.time(), end: pair.time() } : null;
  }
  var lifecycle = rawTimeline.map(pairActorCreationAndStopping).filter(utils.notNull);

  function pairMessageDepartureAndArrival(logData) {
    if (!logData.containsSender())
      return null;
    var messageId = logData.createMessageId();
    function isPair(logData2) { return logData2.containsReceiver() && logData2.createMessageId() === messageId; }
    var pair = rawTimeline.filter(isPair)[0];
    if (pair == null)
      return null;
    var sender   = logData.createNode().label;
    var receiver = pair.createNode().label;
    var label    = "Msg: "+pair.createMessageLabel()+" from "+sender+" to "+receiver;
    return { content: label, start: logData.time(), end: pair.time() };
  }
  var transmissions = rawTimeline.map(pairMessageDepartureAndArrival).filter(utils.notNull);

  var rawData = [].concat(lifecycle).concat(transmissions);

  var container = document.getElementById(this._config.getTimelineId());
  var options = {};
  var data = new vis.DataSet(rawData);

  this._timeline = new vis.Timeline(container, data, options);

  if (typeof (timelineStartedCallback) === "function")
      timelineStartedCallback(this);
}

TimelineController.prototype._startTimeline = function(timelineStartedCallback) {
  console.log("Attempt to initialize timeline");
  var that = this;
  function onDataFetched(jsonArray) {
    console.log("Data fetched successfully");
    that._initiateTimeline(jsonArray, timelineStartedCallback);
  }
  this._fetcher.fetchData(onDataFetched);
}

return TimelineController;
});

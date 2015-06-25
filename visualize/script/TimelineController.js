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

  var noStart = rawTimeline[0];
  var noEnd   = rawTimeline[rawTimeline.length - 1];

  var groups = [];

  function actorWithCreationAndMaybeStopping(logData) {
    if (!logData.containsCreated())
      return null;

    var created = logData.createNode();
    var label = "Actor: "+created.id;
    var group = groups.length;
    groups.push({ id: group, content: label });

    function isPair(logData2) { return logData2.containsStopped() && logData2.createNode().id === created.id; }
    var pair = rawTimeline.filter(isPair)[0];
    return { content: created.id, group: group, start: logData.time(), end: ((pair != null) ? pair : noEnd).time() };
  }
  var actorsWithCreationAndMaybeStopping = rawTimeline.map(actorWithCreationAndMaybeStopping).filter(utils.notNull);

  function actorWithStoppingOnly(logData) {
    if (!logData.containsStopped())
      return null;

    var stopped = logData.createNode();
    var group   = groups.length;
    var label   = "Actor: "+stopped.id;

    function isPair(logData2) { return logData2.containsCreated() && logData2.createNode().id === stopped.id; }
    var pair = rawTimeline.filter(isPair)[0];
    if (pair != null)
      return null;

    groups.push({ id: group, content: label });
    return { content: stopped.id, group: group, start: noStart.time(), end: logData.time() };
  }
  var actorsWithStoppingOnly = rawTimeline.map(actorWithStoppingOnly).filter(utils.notNull);

  function messageWithDepartureAndMaybeArrival(logData) {
    if (!logData.containsSender())
      return null;

    var messageId = logData.createMessageId();
    var sender    = logData.createNode().label;
    var group     = groups.length;
    var content   = logData.createMessageLabel();

    function isPair(logData2) { return logData2.containsReceiver() && logData2.createMessageId() === messageId; }
    var pair  = rawTimeline.filter(isPair)[0];
    var label = null;
    if (pair != null) {
      var receiver = pair.createNode().label;
      label = "Msg: "+pair.createMessageLabel()+"<br/>  from "+sender+"<br/>  to "+receiver;
    } else {
      label = "Msg: "+logData.createMessageLabel()+"<br/>  from "+sender;
    }
    groups.push({ id: group, content: label });
    return { content: content, group: group, start: logData.time(), end: ((pair != null) ? pair : noEnd).time() };
  }
  var messagesWithDepartureAndMaybeArrival = rawTimeline.map(messageWithDepartureAndMaybeArrival).filter(utils.notNull);

  function messageWithArrivalOnly(logData) {
    if (!logData.containsReceiver())
      return null;

    var messageId = logData.createMessageId();
    var receiver  = logData.createNode().label;
    var group     = groups.length;

    function isPair(logData2) { return logData2.containsSender() && logData2.createMessageId() === messageId; }
    var pair = rawTimeline.filter(isPair)[0];
    if (pair != null)
      return null;

    var label    = "Msg: "+logData.createMessageLabel()+"<br/>  to "+receiver;
    groups.push({ id: group, content: label });
    return { content: logData.createMessageLabel(), group: group, start: noStart.time(), end: logData.time() };
  }
  var messagesWithArrivalOnly = rawTimeline.map(messageWithArrivalOnly).filter(utils.notNull);

  var rawData = actorsWithCreationAndMaybeStopping.
         concat(actorsWithStoppingOnly).
         concat(messagesWithDepartureAndMaybeArrival).
         concat(messagesWithArrivalOnly);

  var container = document.getElementById(this._config.getTimelineId());
  var options = {};
  var data = new vis.DataSet(rawData);

  this._timeline = new vis.Timeline(container, null, options);
  this._timeline.setGroups(groups);
  this._timeline.setItems(data);

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

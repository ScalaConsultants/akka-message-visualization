'use strict';

define([
  'jquery',
  'utils'
], function($, utils) {

console.log("VisualizationController module loaded");

function VisualizationController(config, tabController, graphController, timelineController) {
  this._config             = config;
  this._tabController      = tabController;
  this._graphController    = graphController;
  this._timelineController = timelineController;
  this._updateInterface(graphController);
}

VisualizationController.prototype.initialize = function() {
  this._tabController.initialize();
  this.startAnew();
}

VisualizationController.prototype.startAnew = function() {
  var that = this;
  this._graphController.startAnew(function(c) { that._onGraphStartedAnew(c) });
  this._timelineController.startAnew(function(c) { that._onTimelineStartedAnew(c); });
}

VisualizationController.prototype.moveForward = function() {
  console.log("Trying to move forward");
  if (this._graphController.canForward()) {
    var that = this;
    this._graphController.moveForward(function (g, c, p) { that._onMoved(g, c, p); });
  }
}

VisualizationController.prototype.moveBackward = function() {
  console.log("Trying to move backward");
  if (this._graphController.canBackward()) {
    var that = this;
    this._graphController.moveBackward(function (g, c, p) { that._onMoved(g, c, p); });
  }
}

VisualizationController.prototype._onGraphStartedAnew = function(graphController) {
  console.log("Loading graph's log into navigation");
  this._config.getGraphLogElement().empty();

  var timeline = graphController.timeline();
  for (var index in timeline) {
    var id    = this._logToId(timeline[index]);
    var value = JSON.stringify(timeline[index].json());
    var child = '<' + this._config.getLogTag() + ' id="' + id + '">' + value + '</' + this._config.getLogTag() + '>';
    this._config.getGraphLogElement().append(child);
  }

  this._updateInterface(graphController);
}

VisualizationController.prototype._onTimelineStartedAnew = function(timelineController) {
  console.log("Loading timeline's log into navigation");
  this._config.getTimelineLogElement().empty();

  var timeline = timelineController.timeline();
  for (var index in timeline) {
    var value = JSON.stringify(timeline[index].json());
    var child = '<' + this._config.getLogTag() + '>' + value + '</' + this._config.getLogTag() + '>';
    this._config.getTimelineLogElement().append(child);
  }
}

VisualizationController.prototype._onMoved = function(graphController, currentPosition) {
  this._config.getCurrentLogElement().removeClass(this._config.getCurrentLogClass());

  if (currentPosition != null) {
    var id = '#' + this._logToId(currentPosition.logData());
    $(id).addClass(this._config.getCurrentLogClass());
  }

  this._updateInterface(graphController);
}

VisualizationController.prototype._updateInterface = function(graphController) {
  console.log("Updating buttons for graph");

  var that = this;

  this._config.getForwardButtonElement().off('click');
  if (this._graphController.canForward()) {
    this._config.getForwardButtonElement().click(function() { that.moveForward(); });
    this._config.getForwardButtonElement().prop('disabled', false);
  } else {
    this._config.getForwardButtonElement().prop('disabled', true);
  }

  this._config.getBackwardButtonElement().off('click');
  if (this._graphController.canBackward()) {
    this._config.getBackwardButtonElement().click(function() { that.moveBackward() });
    this._config.getBackwardButtonElement().prop('disabled', false);
  } else {
    this._config.getBackwardButtonElement().prop('disabled', true);
  }
}

VisualizationController.prototype._logToId = function(logData) {
  return 'id-' + utils.hashCode(JSON.stringify(logData.json()));
}

return VisualizationController;
});

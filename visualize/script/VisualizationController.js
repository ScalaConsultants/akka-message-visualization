'use strict';

define([
  'jquery',
  'utils'
], function($, utils) {

console.log("VisualizationController module loaded");

function VisualizationController(config, graphController) {
  this._config          = config;
  this._graphController = graphController;
  this._updateInterface(graphController);
}

VisualizationController.prototype.initialize = function() {
  this.startAnew();
}

VisualizationController.prototype.startAnew = function() {
  var that = this;
  this._graphController.startAnew(function(c) { that._onStartedAnew(c) });
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

VisualizationController.prototype._onStartedAnew = function(graphController) {
  console.log("Loading timeline into navigation");
  this._config.getLogContainerElement().empty();

  var timeline = graphController.timeline();
  for (var index in timeline) {
    var id    = this._logToId(timeline[index]);
    var value = JSON.stringify(timeline[index].json());
    var child = '<' + this._config.getLogTag() + ' id="' + id + '">' + value + '</' + this._config.getLogTag() + '.>';
    this._config.getLogContainerElement().append(child);
  }

  this._updateInterface(graphController);
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

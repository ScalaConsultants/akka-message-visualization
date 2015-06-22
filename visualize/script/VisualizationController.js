'use strict';

define([
  'jquery',
  'utils'
], function($, utils) {

console.log("VisualizationController module loaded");

function VisualizationController(graphController, forwardButtonDomName, backwardButtonDomName, logContainerDomName, logElementDomName) {
  this._graphController     = graphController;
  this._forwardButtonDom    = $(forwardButtonDomName);
  this._backwardButtonDom   = $(backwardButtonDomName);
  this._logContainerDomName = logContainerDomName;
  this._logElementDomName   = logElementDomName;
  this._updateInterface(graphController);
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
  $(this._logContainerDomName).empty();

  var timeline = graphController.timeline();
  for (var index in timeline) {
    var id    = this._logToId(timeline[index]);
    var value = JSON.stringify(timeline[index].json());
    var child = '<' + this._logElementDomName + ' id="' + id + '">' + value + '</' + this._logElementDomName + '.>';
    $(this._logContainerDomName).append(child);
  }

  this._updateInterface(graphController);
}

VisualizationController.prototype._onMoved = function(graphController, currentPosition) {
  $('.current-log').removeClass('current-log');

  if (currentPosition != null) {
    var id = '#' + this._logToId(currentPosition.logData());
    $(id).addClass('current-log');
  }

  this._updateInterface(graphController);
}

VisualizationController.prototype._updateInterface = function(graphController) {
  console.log("Updating buttons for graph");

  var that = this;

  this._forwardButtonDom.off('click');
  if (this._graphController.canForward()) {
    this._forwardButtonDom.click(function() { that.moveForward(); });
    this._forwardButtonDom.prop('disabled', false);
  } else {
    this._forwardButtonDom.prop('disabled', true);
  }

  this._backwardButtonDom.off('click');
  if (this._graphController.canBackward()) {
    this._backwardButtonDom.click(function() { that.moveBackward() });
    this._backwardButtonDom.prop('disabled', false);
  } else {
    this._backwardButtonDom.prop('disabled', true);
  }
}

VisualizationController.prototype._logToId = function(logData) {
  return 'id-' + utils.hashCode(JSON.stringify(logData.json()));
}

return VisualizationController;
});

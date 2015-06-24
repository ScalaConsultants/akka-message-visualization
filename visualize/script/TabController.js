'use strict';

define([
  'jquery'
], function($) {

console.log("TabController module loaded");

function TabController(config) {
  this._config = config;
}

TabController.prototype.initialize = function(visualizationController) {
  console.log("Activating tab buttons");
  var that = this;
  this._config.getGraphButtonElement().click(function() { that.setGraphTab(visualizationController); });
  this._config.getTimelineButtonElement().click(function() { that.setTimelineTab(visualizationController); });
}

TabController.prototype.setGraphTab = function(visualizationController) {
  console.log("Changing to Graph tab");
  this._config.getActiveTabElement().removeClass(this._config.getActiveTabClass());
  this._config.getGraphTabElement().addClass(this._config.getActiveTabClass());
  visualizationController.startAnew();
}

TabController.prototype.setTimelineTab = function(visualizationController) {
  console.log("Changing to Timeline tab");
  this._config.getActiveTabElement().removeClass(this._config.getActiveTabClass());
  this._config.getTimelineTabElement().addClass(this._config.getActiveTabClass());
  visualizationController.startAnew();
}

return TabController;
});

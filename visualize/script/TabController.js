'use strict';

define([
  'jquery',
  'jqueryui'
], function($, ui) {

console.log("TabController module loaded");

function TabController(config) {
  this._config = config;
}

TabController.prototype.initialize = function() {
  console.log("Activating tab buttons");
  var that = this;
  this._config.getGraphButtonElement().click(function() { that.setGraphTab(); });
  this._config.getTimelineButtonElement().click(function() { that.setTimelineTab(); });
  this._config.getTabNavElement().draggable();
}

TabController.prototype.setGraphTab = function() {
  console.log("Changing to Graph tab");
  this._config.getActiveTabElement().removeClass(this._config.getActiveTabClass());
  this._config.getGraphTabElement().addClass(this._config.getActiveTabClass());
}

TabController.prototype.setTimelineTab = function() {
  console.log("Changing to Timeline tab");
  this._config.getActiveTabElement().removeClass(this._config.getActiveTabClass());
  this._config.getTimelineTabElement().addClass(this._config.getActiveTabClass());
}

return TabController;
});

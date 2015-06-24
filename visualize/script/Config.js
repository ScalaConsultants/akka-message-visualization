'use strict';

define([
  'jquery'
], function($) {

console.log("Config module loaded");

function Config() {
  // common
  this._inputFile        = './data.txt';
  // tab specific
  this._graphButtonId    = 'set-graph';
  this._timelineButtonId = 'set-timeline';
  this._graphTabId       = 'graph-tab';
  this._timelineTabId    = 'timeline-tab';
  this._activeTabClass   = 'active-tab';
  // graph specific
  this._graphId          = 'messages-graph';
  this._forwardButtonId  = 'move-forward';
  this._backwardButtonId = 'move-backward';
  this._logContainerId   = 'log-list-graph';
  this._logTag           = 'li';
  this._currentLogClass  = 'current-tag';
}

// common

Config.prototype.getInputFileName = function() { return this._inputFile; }

// tab specific

Config.prototype.getGraphButtonId      = function() { return this._graphButtonId; }
Config.prototype.getGraphButtonElement = function() { return $('#'+this._graphButtonId); }

Config.prototype.getTimelineButtonId      = function() { return this._timelineButtonId; }
Config.prototype.getTimelineButtonElement = function() { return $('#'+this._timelineButtonId); }

Config.prototype.getGraphTabId      = function() { return this._graphTabId; }
Config.prototype.getGraphTabElement = function() { return $('#'+this._graphTabId); }

Config.prototype.getTimelineTabId      = function() { return this._timelineTabId; }
Config.prototype.getTimelineTabElement = function() { return $('#'+this._timelineTabId); }

Config.prototype.getActiveTabClass   = function() { return this._activeTabClass; }
Config.prototype.getActiveTabElement = function() { return $('.'+this._activeTabClass); }

// graph specific

Config.prototype.getGraphId      = function() { return this._graphId; }
Config.prototype.getGraphElement = function() { return $('#'+this._graphId); }

Config.prototype.getForwardButtonId      = function() { return this._forwardButtonId; }
Config.prototype.getForwardButtonElement = function() { return $('#'+this._forwardButtonId); }

Config.prototype.getBackwardButtonId      = function() { return this._backwardButtonId; }
Config.prototype.getBackwardButtonElement = function() { return $('#'+this._backwardButtonId); }

Config.prototype.getLogContainerId      = function() { return this._logContainerId; }
Config.prototype.getLogContainerElement = function() { return $('#'+this._logContainerId); }

Config.prototype.getLogTag = function() { return this._logTag; }

Config.prototype.getCurrentLogClass   = function() { return this._currentLogClass; }
Config.prototype.getCurrentLogElement = function() { return $('.'+this._currentLogClass); }

return Config;
});

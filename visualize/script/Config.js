'use strict';

define([
  'jquery'
], function($) {

console.log("Config module loaded");

function ofClass(className) { return $('.'+className); }
function ofId(id) { return $('#'+id); }

function Config() {
  // common
  this._inputFile        = './data.txt';
  this._logTag           = 'li';

  // tab specific
  this._graphTabId       = 'graph-tab';
  this._timelineTabId    = 'timeline-tab';
  this._activeTabClass   = 'active-tab';
  this._graphButtonId    = 'set-graph';
  this._timelineButtonId = 'set-timeline';

  // graph specific
  this._graphId          = 'messages-graph';
  this._graphLogId       = 'log-list-graph';
  this._currentLogClass  = 'current-log';
  this._forwardButtonId  = 'move-forward';
  this._backwardButtonId = 'move-backward';

  // timeline specific
  this._timelineId       = 'messages-timeline';
  this._timelineLogId    = 'log-list-timeline';
}

// common

Config.prototype.getInputFileName = function() { return this._inputFile; }

Config.prototype.getLogTag = function() { return this._logTag; }

// tab specific

Config.prototype.getGraphTabId      = function() { return this._graphTabId; }
Config.prototype.getGraphTabElement = function() { return ofId(this._graphTabId); }

Config.prototype.getTimelineTabId      = function() { return this._timelineTabId; }
Config.prototype.getTimelineTabElement = function() { return ofId(this._timelineTabId); }

Config.prototype.getActiveTabClass   = function() { return this._activeTabClass; }
Config.prototype.getActiveTabElement = function() { return ofClass(this._activeTabClass); }

Config.prototype.getGraphButtonId      = function() { return this._graphButtonId; }
Config.prototype.getGraphButtonElement = function() { return ofId(this._graphButtonId); }

Config.prototype.getTimelineButtonId      = function() { return this._timelineButtonId; }
Config.prototype.getTimelineButtonElement = function() { return ofId(this._timelineButtonId); }

// graph specific

Config.prototype.getGraphId      = function() { return this._graphId; }
Config.prototype.getGraphElement = function() { return ofId(this._graphId); }

Config.prototype.getGraphLogId      = function() { return this._graphLogId; }
Config.prototype.getGraphLogElement = function() { return ofId(this._graphLogId); }

Config.prototype.getCurrentLogClass   = function() { return this._currentLogClass; }
Config.prototype.getCurrentLogElement = function() { return ofClass(this._currentLogClass); }

Config.prototype.getForwardButtonId      = function() { return this._forwardButtonId; }
Config.prototype.getForwardButtonElement = function() { return ofId(this._forwardButtonId); }

Config.prototype.getBackwardButtonId      = function() { return this._backwardButtonId; }
Config.prototype.getBackwardButtonElement = function() { return ofId(this._backwardButtonId); }

// timeline specific

Config.prototype.getTimelineId      = function() { return this._timelineId; }
Config.prototype.getTimelineElement = function() { return ofId(this._timelineId); }

Config.prototype.getTimelineLogId      = function() { return this._timelineLogId; }
Config.prototype.getTimelineLogElement = function() { return ofId(this._timelineLogId); }

return Config;
});

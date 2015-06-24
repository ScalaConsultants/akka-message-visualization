'use strict';

define([
  'jquery'
], function($) {

console.log("Config module loaded");

function Config() {
  this._graphId          = 'messages-graph';
  this._forwardButtonId  = 'move-forward';
  this._backwardButtonId = 'move-backward';
  this._logContainerId   = 'log-list-graph';
  this._logTag           = 'li';
  this._currentLogClass  = 'current-tag'
  this._inputFile        = './data.txt';
}

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

Config.prototype.getInputFileName = function() { return this._inputFile; }

return Config;
});

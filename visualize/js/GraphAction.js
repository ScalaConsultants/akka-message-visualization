'use strict';

function GraphAction(state, logData) {
  this._state            = state;
  this._logData          = logData;
  this._configureActions = null;
  this._forwardAction    = null;
  this._backwardAction   = null;
  this._meta             = {};
}

GraphAction.prototype.state               = function() { return this._state; }
GraphAction.prototype.logData             = function() { return this._logData; }
GraphAction.prototype.meta                = function() { return this._meta; }

GraphAction.prototype.setConfigureActions = function(action)   { this._configureActions = action; return this; }
GraphAction.prototype.setForward          = function(forward)  { this._forwardAction    = forward; return this; }
GraphAction.prototype.setBackward         = function(backward) { this._backwardAction   = backward; return this; }

GraphAction.prototype.actForward = function() {
  if (this._forwardAction == null)
    this._configureActions(); // lazy initialization of actions - BEWARE! it is stateful!
  if (this._forwardAction != null)
    try {
      this._forwardAction();
    } catch (e) {
      console.error(e);
    }
}

GraphAction.prototype.actBackward = function() {
  if (this._backwardAction() != null)
    try {
      this._backwardAction();
    } catch (e) {
      console.error(e);
    }
}

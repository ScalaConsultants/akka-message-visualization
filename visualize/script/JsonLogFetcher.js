'use strict';

define([
  'utils'
], function(utils) {

console.log("JsonLogFetcher module loaded");

var errorMessage = 'Failed to read "data.txt"';

function JsonLogFetcher(inputUrl) {
  this._inputUrl = inputUrl;
  this._data     = null;
}

JsonLogFetcher.prototype.fetchData = function(callback) {
  var that = this;

  if (this._data != null) {
    if (typeof(callback) === "function")
      callback(this._data);
    return;
  }

  var rawData = new XMLHttpRequest();
  rawData.open('GET', this._inputUrl, true);
  rawData.onload = function() {
    if (that._requestSuccessful(rawData)) {
      that._data = that._parseRawData(rawData.responseText);
      if (typeof(callback) === "function")
        callback(that._data);
    }
  }
  rawData.onerror = function(error) {
    alert(errorMessage)
  }

  rawData.send(null);
}

JsonLogFetcher.prototype._parseRawData = function(data) {
  function safeParse(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  return data.split("\n").map(safeParse).filter(utils.notNull);
}

JsonLogFetcher.prototype._requestSuccessful = function(req) {
  return req.readyState == 4 &&
         (req.status == 0 || (req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223);
}

return JsonLogFetcher;
});


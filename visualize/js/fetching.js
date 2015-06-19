"use strict";

function readDataFile(callback) {
  function requestSuccessful(req) {
    return req.readyState == 4 &&
           (req.status == 0 || (req.status >= 200 && req.status < 300) || req.status == 304 || req.status == 1223);
  }

  var rawData = new XMLHttpRequest();
  rawData.open("GET", "./data.txt", true);
  rawData.onload = function () {
    if (requestSuccessful(rawData))
      callback(rawData.responseText);
  }
  rawData.onerror = function(error) {
    alert("Failed to read 'data.txt'")
  }
  rawData.send(null);
}

function parseRawData(data) {
  function safeParse(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  }

  return data.split("\n").map(safeParse).filter(notNull);
}

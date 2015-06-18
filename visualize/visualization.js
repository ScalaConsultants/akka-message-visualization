"use strict";

function onDataFetched(data) {
  console.log(data);
}

function requestSuccessful(status) {
  return (status == 0 || (status >= 200 && status < 300) || status == 304 || status == 1223);
}

function readDataFile() {
  var rawData = new XMLHttpRequest();
  rawData.open("GET", "./data.txt", true);
  rawData.onload = function () {
    if (rawData.readyState == 4 && requestSuccessful(rawData.status))
      onDataFetched(rawData.responseText.split("\n"));
  }
  rawData.onerror = function(error) {
    alert("Failed to read 'data.txt'")
  }
  rawData.send(null);
}

function onDocumentReady() {
  readDataFile();
}

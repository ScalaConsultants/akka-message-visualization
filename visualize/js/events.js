'use strict';

function onDataFetched(data) {
  var jsonData = parseRawData(data);
  drawGraph(jsonData);
}

function onDocumentReady() {
  readDataFile(onDataFetched);
}

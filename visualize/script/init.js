'use strict';

// for debugging
var graphController;
var visualizationController;

require.config({
  paths: {
    jquery: 'https://code.jquery.com/jquery-1.11.3.min',
    vis:    'https://cdnjs.cloudflare.com/ajax/libs/vis/4.2.0/vis.min',
  },
});

require([
  'jquery',
  'GraphController',
  'VisualizationController'
], function($, GraphController, VisualizationController) {

console.log("init module loaded");

var graphElementDomId     = 'messages-graph';
var forwardButtonDomName  = '#move-forward';
var backwardButtonDomName = '#move-backward';
var logContainerDomName   = '#log-list';
var logElementDomName     = 'li';
var inputFile             = './data.txt';

function onDocumentReady() {
  graphController = new GraphController(graphElementDomId, inputFile);
  visualizationController = new VisualizationController(graphController, forwardButtonDomName, backwardButtonDomName, logContainerDomName, logElementDomName);
  visualizationController.startAnew();
}

$(document).ready(onDocumentReady);

});

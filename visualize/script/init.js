'use strict';

// for debugging
var config;
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
  'Config',
  'GraphController',
  'VisualizationController'
], function($, Config, GraphController, VisualizationController) {

console.log("init module loaded");

function onDocumentReady() {
  config = new Config();
  graphController = new GraphController(config);
  visualizationController = new VisualizationController(config, graphController);
  visualizationController.initialize();
}

$(document).ready(onDocumentReady);

});

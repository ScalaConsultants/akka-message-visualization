'use strict';

// for debugging
var config;
var tabController;
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
  'TabController',
  'GraphController',
  'VisualizationController'
], function($, Config, TabController, GraphController, VisualizationController) {

console.log("init module loaded");

function onDocumentReady() {
  config = new Config();
  tabController = new TabController(config);
  graphController = new GraphController(config);
  visualizationController = new VisualizationController(config, tabController, graphController);
  visualizationController.initialize();
}

$(document).ready(onDocumentReady);

});

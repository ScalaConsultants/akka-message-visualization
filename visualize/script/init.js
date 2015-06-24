'use strict';

// for debugging
var config;
var fetcher;
var tabController;
var graphController;
var timelineController;
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
  'JsonLogFetcher',
  'TabController',
  'GraphController',
  'TimelineController',
  'VisualizationController'
], function($, Config, JsonLogFetcher, TabController, GraphController, TimelineController, VisualizationController) {

console.log("init module loaded");

function onDocumentReady() {
  config                  = new Config();
  fetcher                 = new JsonLogFetcher(config.getInputFileName());
  tabController           = new TabController(config, fetcher);
  graphController         = new GraphController(config, fetcher);
  timelineController      = new TimelineController(config, fetcher);
  visualizationController = new VisualizationController(config, tabController, graphController, timelineController);
  visualizationController.initialize();
}

$(document).ready(onDocumentReady);

});

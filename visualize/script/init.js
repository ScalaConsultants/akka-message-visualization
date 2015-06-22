'use strict';

var lastController; // for debugging

require.config({
  paths: {
    jquery: 'https://code.jquery.com/jquery-1.11.3.min',
    vis:    'https://cdnjs.cloudflare.com/ajax/libs/vis/4.2.0/vis.min',
  },
});

require([
  'jquery',
  'GraphController',
], function($, GraphController) {

console.log("init module loaded");

var graphElementDomId  = 'messages-graph';
var inputFile          = './data.txt';
var animationStepMs    = 500;

function runEnqueuedAction(controller) {
  console.log("Callback called");

  function rerunAfterDelay() {
    console.log("Scheduling next graph update if needed");
    if (controller.canForward())
      setTimeout(function() { runEnqueuedAction(controller); }, animationStepMs);
  }

  if (controller.canForward()) {
    console.log("Scheduled graph update");
    controller.moveForward(rerunAfterDelay);
  }
}

function onDocumentReady() {
  var controller = new GraphController(graphElementDomId, inputFile);
  controller.startAnew(function() { runEnqueuedAction(controller); });
  lastController = controller;
}

$(document).ready(onDocumentReady);

});

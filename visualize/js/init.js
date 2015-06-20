'use strict';

var graphElementDOMId  = 'messages-graph';
var inputFile          = './data.txt';
var animationStepMs    = 500;

var lastController;

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
  var controller = new GraphController(graphElementDOMId, inputFile);
  controller.startAnew(function() { runEnqueuedAction(controller); });
  lastController = controller;
}

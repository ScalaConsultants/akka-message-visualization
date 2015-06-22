'use strict';

define([
  'GraphState',
  'GraphAction',
  'ActionConfigurations',
  'utils'
], function(GraphState, GraphAction, ActionConfigurations, utils) {

console.log("GraphFactory module loaded");

function GraphFactory(logDataTimeline, graphElementDomId) {
  this.createGraph = function() {
    var state = new GraphState(logDataTimeline, graphElementDomId);

    function logDataToGraphAction(logData) {
      var action = new GraphAction(state, logData);
      if (!logData.containsTime())      return null;
      if (logData.containsCreated())    return action.setConfigureActions(ActionConfigurations.createActor);
      if (logData.containsMessage()) {
        if (logData.containsReceiver()) return action.setConfigureActions(ActionConfigurations.messageReceived);
        if (logData.containsSender())   return action.setConfigureActions(ActionConfigurations.messageSent);
      }
      if (logData.containsStopped())    return action.setConfigureActions(ActionConfigurations.actorStopped);
      return null;
    }

    function enqueAction(action) { state.enqueForward(action); }

    logDataTimeline.map(logDataToGraphAction).filter(utils.notNull).reverse().forEach(enqueAction);

    return state;
  }
}

return GraphFactory;
});

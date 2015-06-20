'use strict';

function GraphFactory(logDataTimeline, graphElementDomId) {
  this.createGraph = function() {
    var state = new GraphState(logDataTimeline, graphElementDomId);

    function logDataToGraphAction(logData) {
      var action = new GraphAction(state, logData);
      if (!logData.containsTime())       return null;
      if (logData.containsCreated())    return action.setConfigureActions(createActorActionConfiguration);
      if (logData.containsMessage()) {
        if (logData.containsReceiver()) return action.setConfigureActions(messageReceivedActionConfiguration);
        if (logData.containsSender())   return action.setConfigureActions(messageSentActionConfiguration);
      }
      if (logData.containsStopped())    return action.setConfigureActions(actorStoppedActionConfiguration);
      return null;
    }

    function enqueAction(action) { state.enqueForward(action); }

    logDataTimeline.map(logDataToGraphAction).filter(notNull).reverse().forEach(enqueAction);

    return state;
  }
}

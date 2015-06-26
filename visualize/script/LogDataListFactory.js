'use strict';

define([
  'LogData'
], function(LogData) {

console.log("LogDataListFactory module loaded");

function LogDataListFactory() {}

LogDataListFactory.prototype.create = function(jsonArray) {
  function jsonToLogData(json) { return new LogData(json); }
  return this._logSort(jsonArray.map(jsonToLogData));
}

LogDataListFactory.prototype._logSort = function (logs) {
  function logComparator(logData1, logData2) {
    if (logData1.time() !== logData2.time())
      return new Date(logData1.time()) - new Date(logData2.time());

    function logTypeOrdinal(logData) {
      if (logData.containsCreated())
        return 0;
      if (logData.containsMessage()) {
        if (logData.containsSender())
          return 10;
        if (logData.containsReceiver())
          return 50;
      }
      if (logData.containsStopped())
        return 100;
      console.error("Log event has to be either Actor Creation/Stopping or Message transmission");
      return 1000;
    }

    var orderByType = logTypeOrdinal(logData1) - logTypeOrdinal(logData2);
    if (orderByType !== 0)
      return orderByType;

    // for stability
    return logs.indexOf(logData1) - logs.indexOf(logData2);
  }

  logs.sort(logComparator)

  return logs;
}

return LogDataListFactory;
});


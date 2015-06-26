'use strict';

define([
], function() {

function hashCode(string) {
  var hash = 0;
  for (var c = 0; c < string.length; c++) {
    hash = ((hash << 5) - hash) + string.charCodeAt(c);
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

function notNull(data) {
  return data !== null;
}

function remove(array, value) {
  var index = array.indexOf(value);
  if (index >= 0)
    array.splice(index, 1);
}

function startsWith(str, prefix) {
  return str.slice(0, prefix.length) == prefix;
}

function logSort(logs) {
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

return {
  hashCode: hashCode,
  notNull: notNull,
  remove: remove,
  startsWith: startsWith,
  logSort: logSort
};
});

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

return {
  hashCode: hashCode,
  notNull: notNull,
  remove: remove,
  startsWith: startsWith
};
});

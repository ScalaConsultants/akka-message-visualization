'use strict';

define([
], function() {

function notNull(data) {
  return data !== null;
}

function remove(array, value) {
  var index = array.indexOf(value);
  if (index >= 0)
    array.splice(index, 1);
}

return {
  notNull: notNull,
  remove: remove
};
});

"use strict";

function idUniquenessFilter(value, index, self) {
  function sameIds(checked) { return value.id === checked.id; }
  return self.filter(sameIds)[0] === value;
}

function notNull(data) {
  return data !== null;
}

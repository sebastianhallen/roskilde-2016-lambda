'use strict';

function toUTCDate(date) {
  if (typeof date === 'string') {
    return toUTCDate(new Date(date));
  }

  return new Date(date.toUTCString());
}

module.exports = toUTCDate;

'use strict';
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toUTCDate(date) {
  if (typeof date === 'string') {
    return toUTCDate(new Date(date));
  }

  const utc = new Date(date.toUTCString());

  function toParts() {
    const danishTimeZoneOffsetFromGMT = 2;
    let d = utc.getUTCDay();
    let h = utc.getUTCHours() + danishTimeZoneOffsetFromGMT;
    const m = utc.getUTCMinutes();

    if (h >= 24) {
      h -= 24;
    }
    if ((h - danishTimeZoneOffsetFromGMT) === 0) {
      --d;
    }

    const day = weekdays[d];
    const hour = h > 9 ? h : '0' + h;
    const minutes = m > 9 ? m : '0' + m;
    
    return {
      day, hour, minutes
    };
  }

  utc.toTimeString = () => {
    const parts = toParts();
    return parts.hour + ':' + parts.minutes;
  };
  
  utc.toDateString = () => {
    const parts = toParts();
    return parts.day + ' ' + utc.toTimeString();
  };
  return utc;
}

module.exports = toUTCDate;

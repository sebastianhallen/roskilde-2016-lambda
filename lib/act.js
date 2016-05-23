'use strict';

const utcDate = require('./utcdate');
const startDate = new Date('2016-06-29T00:00:00.000Z');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Act(data) {
  this.data = data;

  this.gig = (() => {
    const thisYearsGigs = this.data.gigs
      .filter(gig => utcDate(gig.dateTime) > startDate)
      .sort(gig => gig.dateTime)
      .reverse();

    if (thisYearsGigs.length > 0) {
      return thisYearsGigs[0];
    }
    return null;
  })();

  this.isPlayingAtFestival = this.gig !== null;

  this.displayName = this.data.displayName;

  this.description = this.data.description;

  function toDateString(date, dn) {
    const danishTimeZoneOffsetFromGMT = 2;
    let d = date.getUTCDay();
    let h = date.getUTCHours() + danishTimeZoneOffsetFromGMT;
    const m = date.getUTCMinutes();

    if (h >= 24) {
      h -= 24;
    }
    if ((h - danishTimeZoneOffsetFromGMT) === 0) {
      --d;
    }

    const day = weekdays[d];
    const hour = h > 9 ? h : '0' + h;
    const minutes = m > 9 ? m : '0' + m;
    return day + ' ' + hour + ':' + minutes;
  }

  this.schedule = () => {
    const gigDate = utcDate(this.gig.dateTime);
    const stage = this.gig.stage.name;
    const message = this.displayName + ' plays at ' + stage + ' on ' + toDateString(gigDate, this.displayName);

    return message;
  };
}

module.exports = Act;

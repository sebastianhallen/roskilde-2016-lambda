'use strict';

const utcDate = require('./utcdate');
const startDate = new Date('2016-06-29T00:00:00.000Z');

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

  this.schedule = () => {
    const gigDate = utcDate(this.gig.dateTime);
    const stage = this.gig.stage.name;
    const message = this.displayName + ' plays at ' + stage + ' on ' + gigDate.toDateString()

    return message;
  };
}

module.exports = Act;

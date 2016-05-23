'use strict'

const fs = require('fs');
const request = require('request-promise');

const api = 'http://www.roskilde-festival.dk/api';
const startDate = new Date('2016-06-29T00:00:00.000Z');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toUTCDate(date) {
  if (typeof date === 'string') {
    return toUTCDate(new Date(date));
  }

  return new Date(date.toUTCString());
}

function Act(data) {
  this.data = data;

  this.gig = (() => {
    const thisYearsGigs = this.data.gigs
      .filter(gig => toUTCDate(gig.dateTime) > startDate)
      .sort(gig => gig.dateTime)
      .reverse();

    if (thisYearsGigs.length > 0) {
      return thisYearsGigs[0];
    }
    return null;
  })();

  this.isPlayingAtFestival = this.gig !== null;

  this.displayName = this.data.displayName;

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
    const gigDate = toUTCDate(this.gig.dateTime);
    const stage = this.gig.stage.name;
    const message = this.displayName + ' plays at ' + stage + ' on ' + toDateString(gigDate, this.displayName);

    return message;
  };
}

function saveArtistsToDisk() {
  return request({
    uri: api + '/artists',
    json: true
  })
  .then(data => {
    return new Promise((resolve, reject) => {
      const fileStream = fs.writeFile('./api-data.json', JSON.stringify(data), {}, resolve);
    })
  })
  .catch(error => console.log('error: ' + error));
}

function getActs() {
/*  return request({
    uri: api + '/artists',
    json: true
  });*/
  return Promise.resolve()
    .then(() => JSON.parse(fs.readFileSync('./api-data.json')))
    .then(data => data.map(artist => new Act(artist)))
    .then(acts => acts.filter(act => act.isPlayingAtFestival))
    .then(acts => acts.sort((actA, actB) => {
      const a = actA.gig.dateTime;
      const b = actB.gig.dateTime;
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    }));
}

function slackMessageForActs(acts, filter) {
  return {
    text: 'Acts on ' + filter,
    attachments: acts.map(act => {
      return {
        text: act.schedule()
      };
    })
  };
}


exports.handler = (event, context) => {
  const filterTokens = event.text.split('+');
  const filterType = filterTokens[0];
  const filterCriteria = filterTokens.slice(1);

  function stageFilter(acts) {
    const allStages = acts.map(act => act.gig.stage.name)
    const availableStages = allStages.filter((item, pos) => allStages.indexOf(item) === pos);

    if (filterCriteria.length === 1) {
      const stage = filterCriteria[0];
      if (availableStages.indexOf(stage) === -1) {
        throw 'invalid stage "' + stage + '", use one of: ' + availableStages.join(', ');
      }

      return acts.filter(act => act.gig.stage.name === stage);
    }
    else {
      throw 'must specify a stage, use one of: ' + availableStages.join(', ');
    }
  }
  
  function dayFilter(acts) {
    if (filterCriteria.length === 1) {
      const day = filterCriteria[0].toLowerCase();
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      const utcDay = weekdays.indexOf(capitalizedDay);
      if (utcDay === -1) {
        throw 'invalid day: "' + day + '", use one of: ' + weekdays.join(', ');
      }
      
      return acts.filter(act => {
        const dateHackAdjustment = toUTCDate(act.gig.dateTime);
        if (dateHackAdjustment.getUTCHours() < 6) {
          dateHackAdjustment.setUTCDate(dateHackAdjustment.getUTCDate() - 1)
        }
        dateHackAdjustment.setUTCHours(12);

        return dateHackAdjustment.getUTCDay() === utcDay;
      });
    }
    else {
      throw 'must specify a day, use one of: ' + weekdays.join(', ');
    }
  }


  function actsByStage() {
    return getActs()
      .then(stageFilter)
      .then(acts => context.succeed(slackMessageForActs(acts, filterCriteria.join(' '))))
      .catch(error => context.fail(error));
  }
  
  function actsByDay() {
    return getActs()
      .then(dayFilter)
      .then(acts => context.succeed(slackMessageForActs(acts, filterCriteria.join(' '))))
      .catch(error => context.fail(error));
  }

  const payload = {
    'stage': actsByStage,
    'day': actsByDay,
    'whatsnext': nextUpcomingActs
  }[filterType];
  
  if (payload) {
    Promise.all([payload()]);
  }
  else {
    context.fail('unhandled event: ' + event.text);
  }
}



exports.handler({
  //text: 'day+Friday'
  //text: 'stage+Apollo'
  text: 'whatsnext'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});


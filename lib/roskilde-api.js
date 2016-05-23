'use strict';

const fs = require('fs');
const request = require('request-promise');
const Act = require('./act');

const api = 'http://www.roskilde-festival.dk/api';

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

module.exports.getActs = getActs;

'use strict';

const fs = require('fs');
const request = require('request-promise');
const Act = require('./act');

const api = 'http://www.roskilde-festival.dk/api';
const localData = './api-data.json';

function saveArtistsToDisk() {
  return request({
    uri: api + '/artists',
    json: true
  })
  .then(data => data.map(artist => new Act(artist)))
  .then(acts => acts.filter(act => act.isPlayingAtFestival))
  .then(acts => {
    return new Promise((resolve, reject) => {
      const filteredData = acts.map(act => act.data);
      const fileStream = fs.writeFile(localData, JSON.stringify(filteredData), {}, () => resolve(filteredData));
    })
  })
  .catch(error => console.log('error: ' + error));
}

function getActs() {
  return new Promise((resolve) => {
      fs.access(localData, fs.F_OK, error => {
        if (error) {
          return saveArtistsToDisk().then(data => resolve(data));
        }
        const data = JSON.parse(fs.readFileSync(localData));
        resolve(data);
      });
    })
    .then(data => data.map(artist => new Act(artist)))
    //.then(acts => acts.filter(act => act.isPlayingAtFestival))
    .then(acts => acts.sort((actA, actB) => {
      const a = actA.gig.dateTime;
      const b = actB.gig.dateTime;
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    }));
}

module.exports.getActs = getActs;

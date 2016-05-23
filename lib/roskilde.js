'use strict'

const fs = require('fs');
const request = require('request-promise');
const Act = require('./act');
const api = require('./roskilde-api');
const utcDate = require('./utcdate');
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function Roskilde(args) {
  const filterType = args.filterType;
  const filterCriteria = args.filterCriteria;
  
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
      const utcDay = weekdays.findIndex((e, i) => {
        return e.startsWith(capitalizedDay);
      });

      if (utcDay === -1) {
        throw 'invalid day: "' + day + '", use one of: ' + weekdays.join(', ');
      }
      
      return acts.filter(act => {
        const dateHackAdjustment = utcDate(act.gig.dateTime);

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


  return {
    actsByStage: () => {
      console.log('actsByStage');
      return api.getActs().then(stageFilter);
    },
    actsByDay: () => {
      console.log('actsByDay');
      return api.getActs().then(dayFilter);
    }
  };
};

module.exports = Roskilde;

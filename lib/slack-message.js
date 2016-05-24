'use strict';

const querystring = require('querystring');
const utcDate = require('./utcdate');

const stageSettings = [{
  name: 'Arena',
  color: '#3232ff'
}, {
  name: 'Orange',
  color: '#ff880e'
}, {
  name: 'Avalon',
  color: '#78ccff'
}];

function forActsGroupedByStage(acts, stageFilter) {
  const actsByStage = acts.map(act => {
    return {
      stage: act.gig.stage.name,
      playing: utcDate(act.gig.dateTime).toTimeString() + ': ' + act.displayName 
    }
  })
  .reduce((prev, current) => {
    prev[current.stage] = prev[current.stage] || [];
    prev[current.stage].push(current.playing);
    return prev;
  }, {});

  return {
    text: 'Acts on ' + stageFilter,
    attachments: [{
      fields: Object.keys(actsByStage)
        .map(stage => {
          return {
            title: stage,
            value: actsByStage[stage].join('\n'),
            short: true
          }
        })
    }]
  };
}

function forActsGroupedByDay(acts, filter) {
  const actsByDay = acts.map(act => {
    const day = utcDate(act.gig.dateTime).toDayString();
    const info = utcDate(act.gig.dateTime).toTimeString() + ': ' + act.displayName;

    return {
      day,
      playing: info 
    }
  })
  .reduce((prev, current) => {
    prev[current.day] = prev[current.day] || [];
    prev[current.day].push(current.playing);
    return prev;
  }, {});

  const stageSetting = stageSettings.filter(s => s.name.toLowerCase() === filter.toLowerCase());
  const color = stageSetting.length === 0 ? null : stageSetting[0].color;

  return {
    text: 'Acts on ' + filter,
    attachments: [{
      color: color,
      fields: Object.keys(actsByDay)
        .map(day => {
          return {
            title: day,
            value: actsByDay[day].join('\n'),
            short: true
          }
        })
    }]
  };
}

function forActs(acts, filter) {
  return {
    text: 'Acts on ' + filter,
    attachments: acts.map(act => {
      const stage = act.gig.stage.name;
      const stageSetting = stageSettings.filter(s => s.name.toLowerCase() === stage.toLowerCase());
      const color = stageSetting.length === 0 ? 'gray' : stageSetting[0].color;

      return {
        text: act.schedule(),
        color: color
      };
    })
  };
}

function forDetailedActs(acts, filter) {
  return {
    text: 'Artist: ' + filter,
    attachments: acts.map(act => {
      return {
        text: act.schedule() + ': ' + act.description
      };
    })
  };
}

function withAttachments(text, attachments) {
  return {
    text: querystring.unescape(text),
    attachments: attachments.map(a => Object.assign(a, {
      text: unescape(a.text)
    }))
  };
}

module.exports = {
  forActs,
  forDetailedActs,
  forActsGroupedByStage,
  forActsGroupedByDay,
  withAttachments
};

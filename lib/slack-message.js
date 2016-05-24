'use strict';

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

function forActsByStage(acts, filter) {
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
    text: 'Acts on ' + filter,
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

module.exports = {
  forActs,
  forDetailedActs,
  forActsByStage
};

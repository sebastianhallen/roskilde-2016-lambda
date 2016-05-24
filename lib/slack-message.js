'use strict';
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
  forDetailedActs
};

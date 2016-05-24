'use strict';

const api = require('../lib/roskilde-api');
const utcDate = require('../lib/utcdate');
const Roskilde = require('../lib/roskilde');
const request = require('request-promise');

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

function slackMessageForActs(acts, filter) {
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

function slackMessageForActsWithDetails(acts, filter) {
  return {
    text: 'Artist: ' + filter,
    attachments: acts.map(act => {
      return {
        text: act.schedule() + ': ' + act.description
      };
    })
  };
}

module.exports.handler = (event, context, cb) => {
  const filterTokens = event.text.split('+');
  const filterType = filterTokens[0];
  const filterCriteria = filterTokens.slice(1);
  
//  const filterType = 'day';
//  const filterCriteria = ['Wednesday'];
  
  const args = {
    filterType,
    filterCriteria
  };

  const payload = {
    'stage': new Roskilde(args).actsByStage,
    'day': new Roskilde(args).actsByDay,
    'whois': new Roskilde(args).actsByName
  }[filterType];

  const render = {
    'stage': slackMessageForActs,
    'day': slackMessageForActs,
    'whois': slackMessageForActsWithDetails,
  }[filterType];

  if (payload) {
    Promise.all([
      payload()
        .then(acts => context.succeed(render(acts, filterCriteria.join(' '))))
        .then(acts => cb(null, {
          message: 'lambda done'
        }))
        .catch(error => context.fail(error))
    ]);
  }
  else {
    context.fail('unhandled event: ' + event.text);
  }
}

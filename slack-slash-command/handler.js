'use strict';

const api = require('../lib/roskilde-api');
const utcDate = require('../lib/utcdate');
const Roskilde = require('../lib/roskilde');
const slackMessage = require('../lib/slack-message');
const request = require('request-promise');

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
    'stage': slackMessage.forActsGroupedByDay,
    'day': slackMessage.forActsGroupedByStage,
    'whois': slackMessage.forDetailedActs,
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

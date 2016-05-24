'use strict';

const api = require('../lib/roskilde-api');
const utcDate = require('../lib/utcdate');
const Roskilde = require('../lib/roskilde');
const slackMessage = require('../lib/slack-message');
const request = require('request-promise');

module.exports.handler = (event, context, cb) => {
  const commandTokens = (event && event.text) ? event.text.split('+') : [];
  const command = commandTokens.length > 0 ? commandTokens[0] : null;
  const commandArgs = commandTokens.length > 1 ? commandTokens.slice(1) : [];

  const args = {
    command,
    commandArgs
  };

  let render = {
    'stage': slackMessage.forActsGroupedByDay,
    'day': slackMessage.forActsGroupedByStage,
    'whois': slackMessage.forDetailedActs,
    'usage': () => slackMessage.withAttachments('usage: ', [
      { text: 'get acts by day: ' + event.command + ' day Friday' },
      { text: 'get acts by stage: ' + event.command + ' stage Orange' },
      { text: 'get info about artist: ' + event.command + ' whois miike' }
    ])
  }[command];

  let payload = {
    'stage': new Roskilde(args).actsByStage,
    'day': new Roskilde(args).actsByDay,
    'whois': new Roskilde(args).actsByName,
    'usage': () => Promise.resolve([])
  }[command];
  
  if (!payload) {
    payload = () => Promise.resolve([])
    render = () => slackMessage.withAttachments(
      'unhandled command: "' + command + '" ' + commandArgs.join(' '),
      [{
        color: '#aa0101',
        text: 'try ' + event.command + ' usage'
      }]);
  }

  if (!render) {
    throw 'no renderer specified for command "' + command + '"';
  }

  if (payload) {
    Promise.all([
      payload()
        .then(acts => context.succeed(render(acts, commandArgs.join(' '))))
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

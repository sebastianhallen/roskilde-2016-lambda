'use strict'

const api = require('./lib/roskilde-api');
const utcDate = require('./lib/utcdate');
const Roskilde = require('./lib/roskilde');

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
  
  const args = {
    filterType,
    filterCriteria
  };
  const payload = {
    'stage': new Roskilde(args).actsByStage,
    'day': new Roskilde(args).actsByDay
  }[filterType];
  
  if (payload) {
    Promise.all([
      payload()
        .then(acts => context.succeed(slackMessageForActs(acts, filterCriteria.join(' '))))
        .catch(error => context.fail(error))
    ]);
  }
  else {
    context.fail('unhandled event: ' + event.text);
  }
}

exports.handler({
  text: 'day+Friday'
  //text: 'stage+Apollo'
  //text: 'whatsnext'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});

exports.handler({
  //text: 'day+Friday'
  text: 'stage+Apollo'
  //text: 'whatsnext'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});


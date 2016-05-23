'use strict'

const api = require('./lib/roskilde-api');
const utcDate = require('./lib/utcdate');
const Roskilde = require('./lib/roskilde');

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
/*
// uncomment for local testing
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
exports.handler({
  text: 'day+Sat'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});
*/


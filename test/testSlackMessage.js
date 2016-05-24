'use strict'

const Act = require('../lib/act');
const slackMessage = require('../lib/slack-message');
  const assert = require('chai').assert;

function sample(artist, stage, time) {
  return new Act({
    displayName: artist,
    gigs: [{
      stage: {
        name: stage
      },
      dateTime: time
    }]
  })
}
const actsOnSameDay = [
  sample('M83', 'Orange', '2016-07-01T23:30:00.000Z'),
  sample('Tame Impala', 'Arena', '2016-07-01T21:30:00.000Z'),
  sample('Neil Young', 'Orange', '2016-07-01T19:00:00.000Z'),
  sample('James Blake', 'Arena', '2016-07-02T00:00:00.000Z'),
  sample('Meshuggah', 'Avalon', '2016-07-01T23:15:00.000Z'),
];

const actsOnSameStage = [
  sample('M83', 'Orange', '2016-07-01T23:30:00.000Z'),
  sample('Neil Young', 'Orange', '2016-07-01T19:00:00.000Z'),
  sample('Mø', 'Orange', '2016-07-02T20:00:00.000Z'),
  sample('LCD Soundsystem', 'Orange', '2016-07-02T23:00:00.000Z')
];

describe('Slack message', function() {
  this.timeout(15000);

  describe('forActsGroupedByStage', () => {
    const message = slackMessage.forActsGroupedByStage(actsOnSameDay, 'Friday');
    function groupByStage(stage) {
      return message.attachments[0].fields
        .filter(field => field.title === stage)
        .map(field => field.value)
        .join();
    }

    it('should include day in header', done => {
      assert(message.text === 'Acts on Friday');
      done();
    });
    
    it('should format message grouped by stage', done => {
      const orange = groupByStage('Orange');
      const arena = groupByStage('Arena');
      const avalon = groupByStage('Avalon');
      const orangeExpected = '01:30: M83\n21:00: Neil Young';
      const arenaExpected = '23:30: Tame Impala\n02:00: James Blake';
      const avalonExpected = '01:15: Meshuggah';

      assert(orange === orangeExpected, orange);
      assert(arena === arenaExpected, arena);
      assert(avalon === avalonExpected, avalon);
      done();
    });
  });
  
  describe('forActsGroupedByDay', () => {
    const message = slackMessage.forActsGroupedByDay(actsOnSameStage, 'Orange');
    function actsGroupedByDay(day) {
      return message.attachments[0].fields
        .filter(field => field.title === day)
        .map(field => field.value)
        .join();
    }

    it('should include day in header', done => {
      assert(message.text === 'Acts on Orange');
      done();
    });

    it('should have color matching stage', done => {
      const color = message.attachments[0].color;

      assert(color === '#ff880e', color);
      done();
    });
    
    it('should format message grouped by day', done => {
      const friday = actsGroupedByDay('Friday');
      const saturday = actsGroupedByDay('Saturday');

      const fridayExpected = '01:30: M83\n21:00: Neil Young';
      const saturdayExpected = '22:00: Mø\n01:00: LCD Soundsystem';

      assert(friday === fridayExpected, friday);
      assert(saturday === saturdayExpected, saturday);
      done();
    });
  });
  
});
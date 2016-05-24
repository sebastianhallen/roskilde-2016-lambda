'use strict'

const roskildeFunction = require('./slack-slash-command/handler');
const assert = require('chai').assert;

function testDefaultRoskildeCommand(text, done) {
    roskildeFunction.handler({
      text: text
    }, {
      succeed: data => { 
        assert(data.text !== 'Missing text!');
        assert(data.attachments.length !== 0, 'Has no attachments!')
        done(); 
      },
      fail: error => { 
        done(error); 
      }
    }, () => {});
}


describe('Roskilde', function() { 
  this.timeout(15000);

  it('should get acts by day', done => testDefaultRoskildeCommand('day+Friday', done));
  it('should get acts by shorthand day', done => testDefaultRoskildeCommand('day+sat', done));
  it('should get acts by stage', done => testDefaultRoskildeCommand('stage+Apollo', done));
  it('should get details for artist', done => testDefaultRoskildeCommand('whois+UNCLE+ACID+&+THE+DEADBEATS', done));
});
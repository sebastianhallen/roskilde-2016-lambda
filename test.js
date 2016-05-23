'use strict'

const roskildeFunction = require('./index');
const assert = require('chai').assert;

describe('Roskilde', function() { 
  this.timeout(15000);

  it('should get acts by day', (done) => {
    roskildeFunction.handler({
      text: 'day+Friday'
    }, {
      succeed: data => { 
        assert(data.text !== 'Missing text!');
        assert(data.attachments.length !== 0, 'Has no attachments!')
        done(); 
      },
      fail: error => { 
        done(error); 
      }
    });
  });

  it('should get acts by shorthand day', (done) => {
    roskildeFunction.handler({
      text: 'day+sat'
    }, {
      succeed: data => { 
        assert(data.text !== 'Missing text!');
        assert(data.attachments.length !== 0, 'Has no attachments!')
        done(); 
      },
      fail: error => { 
        done(error); 
      }
    });
  });

  it('should get acts by stage', (done) => {
    roskildeFunction.handler({
      text: 'stage+Apollo'
    }, {
      succeed: data => { 
        assert(data.text !== 'Missing text!');
        assert(data.attachments.length !== 0, 'Has no attachments!')
        done(); 
      },
      fail: error => { 
        done(error); 
      }
    });
  });

  it('should get details for artist', (done) => {
    roskildeFunction.handler({
      text: 'whois+UNCLE+ACID+&+THE+DEADBEATS'
    }, {
      succeed: data => { 
        assert(data.text !== 'Missing text!');
        assert(data.attachments.length !== 0, 'Has no attachments!')
        done(); 
      },
      fail: error => { 
        done(error); 
      }
    });
  });
});
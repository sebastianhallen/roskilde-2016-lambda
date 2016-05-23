'use strict'

const roskildeFunction = require('./index');

roskildeFunction.handler({
  text: 'day+Friday'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});

roskildeFunction.handler({
  text: 'stage+Apollo'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});

roskildeFunction.handler({
  text: 'whois+UNCLE+ACID+&+THE+DEADBEATS'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});

roskildeFunction.handler({
  text: 'day+Sat'
}, {
  succeed: data => console.log('yay!', data),
  fail: error => console.log('nay:', error)
});
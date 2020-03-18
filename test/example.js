const operations = require('../lib/example.js').operations
const chai = require('chai');

describe('Operations', function () {
  it ('Should be a function', function () {
    chai.expect(operations).to.be.a('function');
  });
});
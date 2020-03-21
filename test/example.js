const operations = require('../lib/example.js').operations
const chai = require('chai');

describe('Operations', function () {
  it ('Should be a function', function () {
    chai.expect(operations).to.be.a('function');
  });
  it ('Should works fine', function() {
    chai.expect(operations(0,2,3)).to.be.equal(5);
    chai.expect(operations(1,2,3)).to.be.equal(-1);
    chai.expect(operations(2,2,3)).to.be.equal(6);
  });
});
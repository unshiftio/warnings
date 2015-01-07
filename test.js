describe('warnings', function () {
  'use strict';

  var assume = require('assume')
    , Warnings = require('./');

  it('is exported as a function', function () {
    assume(Warnings).is.a('function');
  });

  it('can be constructed without new keyword', function () {
    assume(Warnings()).is.instanceOf(Warnings);
  });
});

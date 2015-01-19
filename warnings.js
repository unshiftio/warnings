'use strict';

module.exports = {
  pass: {
    message: 'message here.',
    conditional: function () {
      return true;
    }
  },

  fail: {
    message: 'hello i should fail',
    when: function () {
      return false;
    }
  },

  regexp: {
    message: 'hello, im a regexp based conditional matching semver ranges',
    conditional: /v?\d+?\.\d+?\.\d+?/
  },

  number: {
    message: 'hello, im a straight check number',
    conditional: 1447
  },

  string: {
    message: 'conditionally check a string',
    conditional: 'yes'
  },

  regular: {
    message: 'this message will be outputted'
  },

  array: {
    message: [
      'im also capable of processing array messages so we',
      'can spread these messages over multiple lines',
      'manually'
    ]
  }
};

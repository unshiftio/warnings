describe('warnings', function () {
  'use strict';

  var assume = require('assume')
    , Stream = require('stream')
    , Warnings = require('./');

  it('is exported as a function', function () {
    assume(Warnings).is.a('function');
  });

  it('can be constructed without new keyword', function () {
    assume(Warnings()).is.instanceOf(Warnings);
  });

  describe('#set', function () {
    it('adds a new warnings', function () {
      var warn = new Warnings();

      assume(warn.set).is.a('function');
      assume(warn.warnings).has.length(0);

      assume(warn.set('foo', 'bar')).equals(warn);
      warn.set('bar', { message: 'bar' });

      assume(warn.warnings).has.length(2);
      assume(warn.warnings).contain('foo');
      assume(warn.warnings).contain('bar');

      assume(warn.warnings.foo.message).equals('bar');
      assume(warn.warnings.bar.message).equals('bar');
      assume(warn.warnings.foo.name).equals('foo');
      assume(warn.warnings.bar.name).equals('bar');
    });

    it('can set a warning message using an array', function () {
      var warn = new Warnings();

      warn.set('foo', ['bar', 'pez']);
      assume(warn.warnings.foo.message).is.a('array');
      assume(warn.warnings.foo.message).deep.equals(['bar', 'pez']);
    });
  });

  describe('#read', function () {
    it('includes the warnings from the JS file', function () {
      var warn = new Warnings();

      assume(warn.warnings).has.length(0);
      assume(warn.read(__dirname +'/warnings.js')).equals(warn);
      assume(warn.warnings).has.length(7);

      assume(warn.warnings).to.contain('pass');
      assume(warn.warnings).to.contain('fail');
      assume(warn.warnings).to.contain('regexp');
      assume(warn.warnings).to.contain('number');
      assume(warn.warnings).to.contain('string');
      assume(warn.warnings).to.contain('regular');
      assume(warn.warnings).to.contain('array');
    });

    it('includes the warnings from the JSON file', function () {
      var warn = new Warnings();

      assume(warn.warnings).has.length(0);
      assume(warn.read(__dirname +'/warnings.json')).equals(warn);
      assume(warn.warnings).has.length(2);

      assume(warn.warnings).to.contain('foo');
      assume(warn.warnings).to.contain('hello');
    });
  });

  describe('#disable', function () {
    it('can disable warnings using multiple arguments', function () {
      var warn = new Warnings();

      assume(warn.disabled).has.length(0);
      assume(warn.disable('foo', 'bar')).equals(warn);
      assume(warn.disabled).has.length(2);

      assume(warn.disabled).to.contain('foo');
      assume(warn.disabled).to.contain('bar');
    });

    it('can disable warnings using arrays', function () {
      var warn = new Warnings();

      assume(warn.disabled).has.length(0);
      assume(warn.disable(['foo', 'bar'])).equals(warn);
      assume(warn.disabled).has.length(2);

      assume(warn.disabled).to.contain('foo');
      assume(warn.disabled).to.contain('bar');
    });

    it('can disable warnings using objects', function () {
      var warn = new Warnings();

      assume(warn.disabled).has.length(0);
      assume(warn.disable({ foo: 1, bar: 1 })).equals(warn);
      assume(warn.disabled).has.length(2);

      assume(warn.disabled).to.contain('foo');
      assume(warn.disabled).to.contain('bar');
    });

    it('can disable warnings using strings', function () {
      var warn = new Warnings();

      assume(warn.disabled).has.length(0);
      assume(warn.disable('foo').disable('bar')).equals(warn);
      assume(warn.disabled).has.length(2);

      assume(warn.disabled).to.contain('foo');
      assume(warn.disabled).to.contain('bar');
    });
  });

  describe('#about', function () {
    var messages = []
      , warn, stream;

    beforeEach(function () {
      stream = new Stream();
      stream.write = function write(msg) {
        messages.push(msg);
        return true;
      };

      warn = new Warnings('test', { stream: stream });
      warn.read(__dirname +'/warnings.js');
    });

    afterEach(function () {
      messages.length = 0;
      warn.destroy();
    });

    it('returns false when we want to warn about an unknown topic', function () {
      assume(warn.about('you momo')).is.false();
      assume(messages).has.length(0);

      assume(warn.about('regular')).is.true();
      assume(messages).has.length(1);
    });

    it('does not write disabled messages', function () {
      warn.disable('regular');

      assume(warn.about('regular')).is.false();
      assume(messages).has.length(0);
    });

    it('only writes warnings once', function () {
      assume(warn.about('regular')).is.true();
      assume(messages).has.length(1);

      assume(warn.about('regular')).is.false();
      assume(messages).has.length(1);
    });

    it('does not write if the conditional (function) test fails', function () {
      assume(warn.about('pass')).is.true();
      assume(messages).has.length(1);

      assume(warn.about('fail')).is.false();
      assume(messages).has.length(1);

      warn.set('foo', { message: 'bar', conditional: function (topic) {
        assume(topic).equals('hello world');
        return false;
      }});

      assume(warn.about('foo', 'hello world')).is.false();
    });

    it('does not write if the conditional (regex) test fails', function () {
      assume(warn.about('regexp', 'foo')).is.false();
      assume(messages).has.length(0);

      assume(warn.about('regexp', process.version)).is.true();
      assume(messages).has.length(1);
    });

    it('does === matches against other conditionals', function () {
      assume(warn.about('number', 14447)).is.false();
      assume(warn.about('number', 1447)).is.true();
      assume(warn.about('number', 1447)).is.false();

      assume(warn.about('string', 'no')).is.false();
      assume(warn.about('string', 'no')).is.false();
      assume(warn.about('string', 'yes')).is.true();
      assume(warn.about('string', 'yes')).is.false();
    });

    it('prefixes the output with the namespace', function () {
      warn.about('array');
      assume(messages[0]).contains(warn.namespace);
      assume(messages[0]).contains('manually');
    });
  });
});

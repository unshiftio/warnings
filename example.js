'use strict';

var warnings = require('./' /* warnings */)('warning:unshift.io');

warnings.write([
  'it seems that this might be working as',
  'intended, but there is no way of knowing',
  'except for testing, then it would be great'
]);

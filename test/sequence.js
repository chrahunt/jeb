var assert = require('chai').assert,
    jeb = require('../jeb');

var seq1 = '(function() {' +
  'return a = 1, b = 2, a + b;' +
'})()';

var seq1_parsed = '(function() {\n' +
'    a = 1;\n' +
'    b = 2;\n' +
'    return a + b;\n' +
'})()';

// Make sure parses correctly.
var out = jeb(seq1 + '');
assert.equal(out, seq1_parsed + '', 'parsed correctly');

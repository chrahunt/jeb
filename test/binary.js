var assert = require('chai').assert,
    jeb = require('../jeb');

var fn1 = '(function() {' +
  'c == 0 && fn();' +
'})()';

var fn1_parsed = '(function() {\n' +
'    if (c == 0) {\n' +
'        fn();\n' +
'    }\n' +
'})()';

var fn2 = '(function() {' +
  'c == 0 && (a = 1, b = 2);' +
'})()';

var fn2_parsed = '(function() {\n' +
'    if (c == 0) {\n' +
'        a = 1;\n' +
'        b = 2;\n' +
'    }\n' +
'})()';

describe("jeb", function() {
  it("should parse short-circuit statements", function() {
    var out = jeb(fn1 + '');
    assert.equal(out, fn1_parsed + '', 'parsed correctly');
  });

  it("should parse short-circuit statements with sequences", function() {
    var out = jeb(fn2 + '');
    assert.equal(out, fn2_parsed + '', 'parsed correctly');
  });
});

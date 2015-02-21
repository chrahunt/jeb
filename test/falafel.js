var assert = require('chai').assert,
    jeb = require('../jeb');

// Functions testing falafel-specific issues.
// Force evaluation of for loop by putting in a sequenceexpression.
var fn1 = '(' + function() {
  a = 1, b = function() {
    if (a)
      for (var c=0;c<b.a();c++) return;
  };
} + ')()';

var fn1_parsed = '(function () {\n' +
'    a = 1;\n' +
'    b = function () {\n' +
'        if (a)\n' +
'            for (var c = 0; c < b.a(); c++)\n' +
'                return;\n' +
'    };\n' +
'})()';

describe("jeb", function() {
  it("should handle for loops correctly", function() {
    var out = jeb(fn1 + '');
    assert.equal(out, fn1_parsed + '', 'parsed correctly');
  });
});

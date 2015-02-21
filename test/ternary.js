var assert = require('chai').assert,
    jeb = require('../jeb');

var fn1 = '(function() {' +
  'c == 0 ? a = 1 : a = 2;' +
'})()';

var fn1_parsed = '(function() {\n' +
'    if (c == 0) {\n' +
'        a = 1;\n' +
'    } else {\n' +
'        a = 2;\n' +
'    }\n' +
'})()';

var fn2 = '(function() {' +
  'c == 0 ? v(!u, 2) : c == 1 || c == 2 ? v(u, 2) : c == 3 ? (v(!u, 1), v(u, 1)) : (v(u, 1), v(!u, 1))' +
'})()';

var fn2_parsed = '(function() {\n' +
'    if (c == 0) {\n' +
'        v(!u, 2);\n' +
'    } else if (c == 1 || c == 2) {\n' +
'        v(u, 2);\n' +
'    } else if (c == 3) {\n' +
'        v(!u, 1);\n' +
'        v(u, 1);\n' +
'    } else {\n' +
'        v(u, 1);\n' +
'        v(!u, 1);\n' +
'    }\n' +
'})()';

describe("jeb", function() {
  it("should parse ternary statements", function() {
    var out = jeb(fn1 + '');
    assert.equal(out, fn1_parsed + '', 'parsed correctly');
  });

  it("should parse nested ternary statements and sequences into else if statements", function() {
    var out = jeb(fn2 + '');
    assert.equal(out, fn2_parsed + '', 'parsed correctly');
  });
});

var assert = require('chai').assert,
    jeb = require('../src/jeb');

var fn1 = '(function() {' +
  'return a = 1, b = 2, a + b;' +
'})()';

var fn1_parsed = '(function() {\n' +
'    a = 1;\n' +
'    b = 2;\n' +
'    return a + b;\n' +
'})()';

var fn2 = '(' + function() {
  c = 4;
  return a = 1, b = 2, a + b;
  d = 5;
} + ')()';

var fn2_parsed = '(function () {\n' +
'    c = 4;\n' +
'    a = 1;\n' +
'    b = 2;\n' +
'    return a + b;\n' +
'    d = 5;\n' +
'})()';

var fn3 = '(' + function() {
  return m[e] && (m[e][t] && (n[0] = m[e][t][0]), m[e][t - 1] && (n[3] = m[e][t - 1][3])), m[e - 1] && (m[e - 1][t] && (n[1] = m[e - 1][t][1]), m[e - 1][t - 1] && (n[2] = m[e - 1][t - 1][2])), n
} + ')()';

var fn3_parsed = '(function () {\n' +
'    if (m[e]) {\n' +
'        if (m[e][t]) {\n' +
'            n[0] = m[e][t][0];\n' +
'        }\n' +
'        if (m[e][t - 1]) {\n' +
'            n[3] = m[e][t - 1][3];\n' +
'        }\n' +
'    }\n' +
'    if (m[e - 1]) {\n' +
'        if (m[e - 1][t]) {\n' +
'            n[1] = m[e - 1][t][1];\n' +
'        }\n' +
'        if (m[e - 1][t - 1]) {\n' +
'            n[2] = m[e - 1][t - 1][2];\n' +
'        }\n' +
'    }\n' +
'    return n;\n' +
'})()';

var fn4 = '(' + function() {
  a = 1, b = 2, a += b;
} + ')()';

var fn4_parsed = '(function () {\n' +
'    a = 1;\n' +
'    b = 2;\n' +
'    a += b;\n' +
'})()';

var fn5 = '(' + function() {
  true, true, true;
} + ')()';

var fn5_parsed = '(function () {\n' +
'    true;\n' +
'    true;\n' +
'    true;\n' +
'})()';

describe("jeb", function() {
  it("should parse standalone return statements with sequences", function() {
    var out = jeb(fn1 + '');
    assert.equal(out, fn1_parsed + '', 'parsed correctly');
  });

  it("should parse return statements with sequences without reordering statements", function() {
    var out = jeb(fn2 + '');
    assert.equal(out, fn2_parsed + '', 'parsed correctly');
  });

  it("should parse return statements with sequences that have nested nodes", function() {
    var out = jeb(fn3 + '');
    assert.equal(out, fn3_parsed + '', 'parsed correctly');
  });

  it("should parse standalone sequences", function() {
    var out = jeb(fn4 + '');
    assert.equal(out, fn4_parsed + '', 'parsed correctly');
  });

  it("should wrap literal values in sequences", function() {
    var out = jeb(fn5 + '');
    assert.equal(out, fn5_parsed + '', 'parsed correctly');
  });
});

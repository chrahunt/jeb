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

var seq2 = '(function() {' +
  'c = 4;' +
  'return a = 1, b = 2, a + b;' +
  'd = 5;' +
'})()';

var seq2_parsed = '(function() {\n' +
'    c = 4;\n' +
'    a = 1;\n' +
'    b = 2;\n' +
'    return a + b;\n' +
'    d = 5;\n' +
'})()';

describe("jeb", function() {
  it("should parse standalone return statements with sequences", function() {
    var out = jeb(seq1 + '');
    assert.equal(out, seq1_parsed + '', 'parsed correctly');
  });

  it("should parse return statements with sequences without reordering statements", function() {
    var out = jeb(seq2 + '');
    assert.equal(out, seq2_parsed + '', 'parsed correctly');
  });
});

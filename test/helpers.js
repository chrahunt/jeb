var parse = require('acorn').parse,
    escodegen = require('escodegen'),
    assert = require('chai').assert,
    jeb = require('../src/jeb');

module.exports = {
  wrap_fn: wrap_fn,
  generate_code: generate_code,
  run_test: run_test
};

function wrap_fn(fn) {
  return '(' + fn + '());';
}

function generate_code(data) {
  if (typeof data == "function") {
    data = wrap_fn(data);
  }
  var ast = parse(data);
  return escodegen.generate(ast);
}

/**
 * @typedef TestData
 * @type {object}
 * @property {string} purpose - Reason for test.
 * @property {Function} before - The "before" code.
 * @property {Function} after - The "after" code.
 */
/**
 * Runs the test given by the test data input.
 * @param {TestData} test_data - The data for the test
 */
function run_test(test_data) {
  it(test_data.purpose, function() {
    var out = jeb(wrap_fn(test_data.before));
    assert.equal(out, generate_code(test_data.after));
  });
}

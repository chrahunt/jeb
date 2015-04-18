var util = require('./helpers');

var tests = [{
  purpose: "should parse short-circuit statements",
  before: function() {
    c == 0 && fn();
  },
  after: function() {
    if (c == 0) {
      fn();
    }
  }
}, {
  purpose: "should parse short-circuit statements with sequences",
  before: function() {
    c == 0 && (a = 1, b = 2);
  },
  after: function() {
    if (c == 0) {
      a = 1;
      b = 2;
    }
  }
}, {
  purpose: "should negate the antecedent in OR expressions",
  before: function() {
    --a || fn();
  },
  after: function() {
    if (!--a) {
      fn();
    }
  }
}];

// TODO: Ensure non-short-circuit binary operators are not altered.

describe("jeb's handling of binary statements", function() {
  tests.forEach(util.run_test);
});

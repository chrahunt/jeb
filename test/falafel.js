var util = require('./helpers');

// Functions testing falafel-specific issues.

var tests = [{
  // Force evaluation of for loop by putting in a sequenceexpression.
  purpose: "should handle for loops correctly",
  before: function() {
    a = 1, b = function() {
      if (a)
        for (var c = 0; c < b.a(); c++) return;
    };
  },
  after: function() {
    a = 1;
    b = function() {
      if (a)
        for (var c = 0; c < b.a(); c++)
          return;
    };
  }
}, {
  purpose: "should not break escodegen when using for loop with empty update field",
  before: function() {
    true,
    function() {
      true,
      function() {
        for (;;) {
          true;
        }
      }();
    }();
  },
  after: function() {
    true;
    (function() {
      true;
      (function() {
        for (;;) {
          true;
        }
      }());
    }());
  }
}, {
  purpose: "should not overwrite the name field of an Identifier in a for loop",
  before: function() {
    a,
    function() {
      for (;; a) a
    }();
  },
  after: function() {
    a;
    (function() {
      for (;; a)
        a;
    }());
  }
}];

describe("jeb's use of falafel", function() {
  tests.forEach(util.run_test);
});

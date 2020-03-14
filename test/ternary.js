var util = require('./helpers');

var tests = [{
  purpose: "should parse ternary statements",
  before: function() {
    c == 0 ? a = 1 : a = 2;
  },
  after: function() {
    if (c == 0) {
      a = 1;
    } else {
      a = 2;
    }
  }
}, {
  purpose: "should parse nested ternary statements and sequences into else if statements",
  before: function() {
    c == 0 ? v(!u, 2) : c == 1 || c == 2 ? v(u, 2) : c == 3 ? (v(!u, 1), v(u, 1)) : (v(u, 1), v(!u, 1));
  },
  after: function() {
    if (c == 0) {
      v(!u, 2);
    } else if (c == 1 || c == 2) {
      v(u, 2);
    } else if (c == 3) {
      v(!u, 1);
      v(u, 1);
    } else {
      v(u, 1);
      v(!u, 1);
    }
  }
}, {
  purpose: "should put consequents into block statements",
  before: function() {
    a ? b && a.c(b) : c && a.b(c);
  },
  after: function() {
    if (a) {
      if (b) {
        a.c(b);
      }
    } else if (c) {
      a.b(c);
    }
  }
}/*// Not implemented.
, {
  purpose: "should parse ternary expressions in return statements",
  before: function() {
    return a === null ? b : a;
  },
  after: function() {
    if (a === null) {
      return a;
    } else {
      return b;
    }
  }
}*/];

describe("jeb ternary handling", function() {
  tests.forEach(util.run_test);
});

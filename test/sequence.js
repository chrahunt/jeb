var util = require('./helpers');

var tests = [{
  purpose: "should parse standalone return statements with sequences",
  before: function() {
    return a = 1, b = 2, a + b;
  },
  after: function() {
    a = 1;
    b = 2;
    return a + b;
  }
}, {
  purpose: "should parse return statements with sequences without reordering statements",
  before: function() {
    c = 4;
    return a = 1, b = 2, a + b;
    d = 5;
  },
  after: function() {
    c = 4;
    a = 1;
    b = 2;
    return a + b;
    d = 5;
  }
}, {
  purpose: "should parse return statements with sequences that have nested nodes",
  before: function() {
    return m[e] && (m[e][t] && (n[0] = m[e][t][0]), m[e][t - 1] && (n[3] = m[e][t - 1][3])), m[e - 1] && (m[e - 1][t] && (n[1] = m[e - 1][t][1]), m[e - 1][t - 1] && (n[2] = m[e - 1][t - 1][2])), n
  },
  after: function() {
    if (m[e]) {
      if (m[e][t]) {
        n[0] = m[e][t][0];
      }
      if (m[e][t - 1]) {
        n[3] = m[e][t - 1][3];
      }
    }
    if (m[e - 1]) {
      if (m[e - 1][t]) {
        n[1] = m[e - 1][t][1];
      }
      if (m[e - 1][t - 1]) {
        n[2] = m[e - 1][t - 1][2];
      }
    }
    return n;
  }
}, {
  purpose: "should parse standalone sequences",
  before: function() {
    a = 1, b = 2, a += b;
  },
  after: function() {
    a = 1;
    b = 2;
    a += b;
  }
}, {
  purpose: "should wrap literal values in sequences",
  before: function() {
    true, true, true;
  },
  after: function() {
    true;
    true;
    true;
  }
}, {
  purpose: "should handle multiple sequence statements in one body statement",
  before: function() {
    a, b;
    a, b;
    a, b;
  },
  after: function() {
    a;
    b;
    a;
    b;
    a;
    b;
  }
}];

describe("jeb's sequence reorganization", function() {
  tests.forEach(util.run_test);
});

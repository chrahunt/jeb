var assert = require('chai').assert,
    jeb = require('../jeb');

var fn1 = '(function() {' +
  'c == 0 ? v(!u, 2) : c == 1 || c == 2 ? v(u, 2) : c == 3 ? (v(!u, 1), v(u, 1)) : (v(u, 1), v(!u, 1))' +
'})()';

var fn1_parsed = '(function() {\n' +
'    if (c == 0) {\n' +
'        v(!u, 2);\n' +
'    } else if (c == 1 || c == 2) {\n' +
'        v(u, 2);\n' +
'    } else if (c == 3) {\n' +
'        (v(!u, 1), v(u, 1));\n' +
'    } else {\n' +
'        (v(u, 1), v(!u, 1));\n' +
'    }\n' +
'})()';

// Make sure parses correctly.
var out = jeb(fn1 + '');
assert.equal(out, fn1_parsed + '', 'parsed correctly');

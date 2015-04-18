var language = require('cssauron-falafel'),
    falafel = require('falafel'),
    transform = null;

module.exports = run;

function run(data) {
  var transforms = [
    './transform.js'
  ];

  function parse(data) {
    source = data;

    transform = parse_transform(require(transforms.shift()));
    source = falafel(source + '', apply_transform);
    if(!transforms.length) {
      return source + '';
    }

    parse(source);
  }

  function apply_transform(node) {
    var target,
      result;
    for (var i = 0; i < transform.length; ++i) {
      var transformation = transform[i];
      // Check if this nodes meets selector criteria.
      target = transformation.match(node);
      // If so, process using transformation.
      if (target) {
        // Handle multiple matches.
        if (Array.isArray(target)) {
          target = target[0];
        }
        result = transformation.transform(target);
        // Do not try additional transformations if false is returned.
        if(result === false) {
          break;
        }
      }
    }
  }

  function parse_transform(trans) {
    var output = [];

    for (var key in trans) {
      output.push({
        // Function that takes a node and returns false if it doesn't
        // match or a node/set of nodes if it does.
        match: language(key),
        // Function to pass matched nodes to for transformation.
        transform: trans[key],
        // Unique key for transformation.
        id: key
      });
    }

    return output;
  }

  return parse(data);
}

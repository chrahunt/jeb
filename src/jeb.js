var language = require('cssauron-falafel'),
    falafel = require('falafel');
    transform = null;

module.exports = run;

function run(data) {
  var transforms = [
    './transform.js'
  ];

  function parse(data) {
    source = data;

    transform = parse_transform(
      require(transforms.shift()));

    source = falafel(source + '', apply_transform);
    if(!transforms.length) {
      return source + '';
    }

    parse(source);
  }

  function apply_transform(node) {
    var target,
      result;

    for (var i = 0, len = transform.length; i < len; ++i) {
      // Check if this nodes meets selector criteria.
      target = transform[i].match(node);
      // If so, process using transformation.
      if (target) {
        // Handle multiple matches.
        if (Array.isArray(target)) {
          target = target[0];
        }
        result = transform[i].transform(target);

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
        match: language(key),
        transform: trans[key]
      });
    }

    return output;
  }

  return parse(data);
}

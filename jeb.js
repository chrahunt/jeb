var language = require('cssauron-falafel'),
    falafel = require('falafel');
    transform = null;

module.exports = run;

function run(data) {
  var transforms = [
    './transform.js'
  ];

  function parse(data) {
    source = data

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

    for(var i = 0, len = transform.length; i < len; ++i) {
      if(target = transform[i][0](node)) {
        result = transform[i][1].apply(
          null,
          Array.isArray(target) ? target : [target]);

        if(result === false) {
          break
        }
      }
    }
  }

  function parse_transform(trans) {
    var output = [];

    for (var key in trans) {
      output.push([
        language(key),
        trans[key]
      ]);
    }

    return output;
  }

  return parse(data);
}

var path = require('path'),
  tty = require('tty'),
  fs = require('fs');

var jeb = require('./jeb'),
  concat = require('concat-stream'),
  nopt = require('nopt'),
  shorthand,
  options;

options = {
  'help': Boolean,
  'output': path
};

shorthand = {
  'h': ['--help'],
  'o': ['--output']
};

module.exports = run;

function help() {
/*
jeb
  Takes a JavaScript program as input on stdin, outputs the transformed
  program on stdout.
*/

  var str = help + '';

  process.stdout.write(
    str.slice(str.indexOf('/*') + 3, str.indexOf('*/'))
  );
}

function run() {
  var stdintty = tty.isatty(process.stdin),
    parsed = nopt(options, shorthand),
    source = null,
    output;

  if(parsed.help || (!parsed.argv.remain.length && stdintty)) {
    return help(), process.exit(1);
  }

  if(parsed.argv.remain.length) {
    var input = String(parsed.argv.remain[0]);
    var homePattern = process.platform === 'win32' ? /^~(\/|\\)/ : /^~\//;
    if (input.match(homePattern) && process.env.HOME) {
      input = path.resolve(process.env.HOME, val.substr(2));
    }
    var resolved = path.resolve(String(input));
    if(parsed.output) {
      output = function (data) {
        fs.writeFile(parsed.output, data, function (err) {
          if (err) throw err;
        });
      };
    } else {
      output = function (data) {
        fs.writeFile(resolved, data, function (err) {
          if (err) throw err;
        });
      };
    }
    fs.readFile(resolved, function(err, data) {
      if (err) throw err;
      if (!parsed.output) {
        fs.writeFile(resolved + '.bak', data, function (err) {
          if (err) throw err;
        });
      }
      got_source(data);
    });
  } else {
    output = function (data) {
      process.stdout.write(data + '');
    };
    process.stdin.pipe(concat(got_source));

    if(process.stdin.paused) {
      process.stdin.resume();
    }
  }

  function got_source(data) {
    source = data;
    source = jeb(source + '');
    output(source);
  }
}

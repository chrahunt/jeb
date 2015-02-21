var path = require('path'),
  tty = require('tty'),
  fs = require('fs');

var jeb = require('./jeb'),
  concat = require('concat-stream'),
  nopt = require('nopt'),
  shorthand,
  options

options = {
  'help': Boolean
};

shorthand = {
  'h': ['--help']
};

module.exports = run

function help() {
/*
jeb
  Takes a JavaScript program as input on stdin, outputs the transformed
  program on stdout.
*/

  var str = help + ''

  process.stdout.write(
    str.slice(str.indexOf('/*') + 3, str.indexOf('*/'))
  )
}

function run() {
  var stdintty = tty.isatty(process.stdin),
    parsed = nopt(options, shorthand),
    source = null;

  if(parsed.help || (!parsed.argv.remain.length && stdintty)) {
    return help(), process.exit(1);
  }

  process.stdin.pipe(concat(got_source));

  if(process.stdin.paused) {
    process.stdin.resume();
  }

  function got_source(data) {
    source = data;
    source = jeb(source + '');

    return process.stdout.write(source + '')
  }
}

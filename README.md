# jeb

The **J**avaScript **E**xtra **B**eautifier takes your obfuscated or minified JavaScript and performs a few changes to enhance the final output from actual JS Beautifiers such as [JSBeautifier](http://jsbeautifier.org/) ([source](https://github.com/beautify-web/js-beautify)).

Install [node](https://nodejs.org/download/) if you haven't, then install using `npm install -g jeb`. There are a few options to transform your JS. Jeb can:

* take input from `stdin` and pipe it to `stdout`:
```sh
> cat minified-js.js | jeb > output.js
```

* take a file and overwrite it in-place (backup saved to `*.bak`):
```sh
> jeb minified-js.js
```

* take a file and send output where you specify:
```sh
> jeb minified-js.js -o output.js
```


Incorporate into your project with `npm install jeb`, then:
```javascript
var jeb = require("jeb");

// ... get source ...

var result = jeb(source);
```

## Development

Clone the repo, run `npm install` to install development dependencies. To run tests [mocha](http://mochajs.org/) must be installed. Install by running `npm install -g mocha` then in the root of the project just call `mocha`.

Included tests cover several cases for each transformation that takes place, but for more thorough testing, `jeb` is run on larger libraries and the test suites for those projects are run. So far this has been done successfully on the `jquery` source (the same six errors received on the original build were received on the transformed source with no additional errors).


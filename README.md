# jeb

The **J**avaScript **E**xtra **B**eautifier takes your obfuscated or minified JavaScript and performs a pre-processing step to enhance the final output from actual JS Beautifiers such as [JSBeautifier](http://jsbeautifier.org/) ([source](https://github.com/beautify-web/js-beautify)).

Download using `npm install -g jeb` then transform some js by feeding it in through `stdin`. Output is piped to `stdout`.

Use in your project with `npm install jeb`, then in your file:
```javascript
var jeb = require("jeb");

// ... get source ...

var result = jeb(source);
```

## Development

`npm install` then run tests with `mocha`.

`mocha` can be installed using `npm install -g mocha`.


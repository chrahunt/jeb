var escodegen = require('escodegen');
var name = require('./name');
var language = require('cssauron-falafel');

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

var internal_transform = {
  'expr': process_expr,
  'return': process_return,
  'return > sequence': process_return_sequence,
  'expr > sequence': process_expr_sequence,
  'expr > ternary': process_expr_ternary,
  'expr > binary': process_expr_binary
};

var transforms = parse_transform(internal_transform);

// Parent-level elements edited when children are changed.
module.exports = {
  'block': rewrite_block_statement
};

// Takes a node and parses its relevant AST properly for output.
function ast_output(node) {
  // List of properties to ignore.
  var bad = [
    'start',
    'end',
    'parent',
    'source',
    'rewrite'
  ];
  if (typeof node !== "object" && typeof node !== "function")
    return node;
  var newNode = {};
  for (var prop in node) {
    if (bad.indexOf(prop) !== -1) continue;
    var val = node[prop];

    // For 'body' property.
    if (val instanceof Array) {
      val = val.map(ast_output);
    } else if (val && val.type) {
      val = ast_output(val);
    }
    newNode[prop] = val;
  }
  return newNode;
}

function rewrite(node) {
  node.rewrite(escodegen.generate(ast_output(node)));
}

// Handles block statements with parse-able children.
function rewrite_block_statement(node) {
  // Get the parse-able children of the block statement and run their
  // relevant functions.
  var edited = false;
  var transformations = node.body.map(function(child) {
    for (var i = 0; i < transforms.length; i++) {
      if (transforms[i].match(child)) {
        return function() {
          return transforms[i].transform(child);
        };
      }
    }
  }).filter(function(fn) {
    return typeof fn !== "undefined";
  });
  transformations.forEach(function(t) {
    var result = t();
    if (result) {
      edited = true;
    }
  });
  if (edited) {
    rewrite(node);
  }
}

function process_expr(node) {
  var child = node.expression;
  for (var i = 0; i < transforms.length; i++) {
    if (transforms[i].match(child)) {
      return transforms[i].transform(child);
    }
  }
}

function process_return(node) {
  var child = node.argument;
  if (!child) return;
  for (var i = 0; i < transforms.length; i++) {
    if (transforms[i].match(child)) {
      return transforms[i].transform(child);
    }
  }
}

function process_return_sequence(node) {
  var parent = node.parent;
  var context = parent.parent.body;
  var start = context.indexOf(parent);
  var return_expr = node.expressions.pop();
  // Put expressions into parent context.
  var output = [];
  ParseExpr[name[node.type]].call(null, node, output);
  Array.prototype.splice.apply(context,
    [start, 0].concat(output));
  // Rewrite return statement.
  parent.argument = return_expr;
  return true;
}

function process_expr_sequence(node) {
  var parent = node.parent;
  var context = parent.parent.body;
  var start = context.indexOf(parent);
  // Put expressions into parent context.
  var output = [];
  ParseExpr[name[node.type]].call(null, node, output);
  Array.prototype.splice.apply(context,
    [start, 1].concat(output));
  return true;
}

function process_expr_binary(node) {
  var parent = node.parent;
  var context = parent.parent.body;
  var start = context.indexOf(parent);
  context[start] = util_handle_arbitrary_expr(node);
  return true;
}

function process_expr_ternary(node) {
  var parent = node.parent;
  var context = parent.parent.body;
  var start = context.indexOf(parent);
  var generated = util_handle_arbitrary_expr(node);
  context[start] = generated;
  return true;
}

/**
 * Check that a node is in a suitable context for its children to be
 * expanded above it, creating the context if possible.
 * @param  {ESNode} node - The node to check the context for.
 * @return {boolean} - Whether the context is able to be populated into.
 */
function check_context(node) {
  var parent = node.parent;
  // BlockStatement
  if (name[parent.type] == 'block') {
    return true;
  }
  return false;
}

// Wrap an expression in an expression statement.
function util_wrap_expression(expression) {
  return {
    "type": "ExpressionStatement",
    "expression": expression
  };
}

// Wrap an array of expressions in a block statement.
function util_wrap_block_statement(expressions) {
  return {
    "type": "BlockStatement",
    "body": expressions
  };
}

// Create an if statement.
function util_if_statement(test, consequent, alternate) {
  if (typeof alternate == 'undefined') alternate = null;
  return {
    "type": "IfStatement",
    "test": test,
    "consequent": consequent,
    "alternate": alternate
  };
}

// "Not" the provided expression.
function util_not_expr(expr) {
  return {
    "type": "UnaryExpression",
    "operator": "!",
    "argument": expr,
    "prefix": true
  };
}

// Does conversions and take actions when node is not related directly
// to statement node.
// output is place to write node output class, optionally
function util_handle_arbitrary_expr(node, output) {
  var id = name[node.type];
  if (ParseExpr.hasOwnProperty(id)) {
    return ParseExpr[id].call(null, node, output);
  } else {
    return node;
  }
}

function util_is_statement(node) {
  return node.type.substr(-9) == "Statement";
}

function util_is_expr(node) {
  return node.type.substr(-10) == "Expression";
}

function util_is_literal(node) {
  return node.type == "Literal";
}

function util_is_identifier(node) {
  return node.type == "Identifier";
}

// Whether or not the given node should be wrapped if placed in a statement.
function util_need_expr_wrap(node) {
  return util_is_literal(node) || util_is_expr(node) ||
    util_is_identifier(node);
}

// Handle generic expression 
var ParseExpr = {
  /**
   * Turn a binary expression into an if/if-else. The 
   * @param  {ESNode} node - The binary expression.
   * @return {ESNode} - The constructed if statement.     [description]
   */
  binary: function(node) {
    if (node.operator !== "&&" && node.operator !== "||") {
      return node;
    }
    var consequent, test;
    var consequent_statements = [];
    var c_node = util_handle_arbitrary_expr(
      node.right,
      consequent_statements);
    if (c_node) {
      if (util_is_expr(c_node)) {
        consequent_statements = [util_wrap_expression(c_node)];
        consequent = util_wrap_block_statement(consequent_statements);
      } else {
        consequent = c_node;
      }
    } else {
      consequent = util_wrap_block_statement(consequent_statements);
    }
    if (node.operator == "&&") {
      test = node.left;
    } else {
      test = util_not_expr(node.left);
    }
    return util_if_statement(test, consequent);
  },

  /**
   * Alters an array with the sequence expression values, appropriate
   * for placing in a statement body.
   * @param  {ESNode} node - The sequence expression node.
   * @param {Array} output - The array to output to.
   */
  sequence: function(node, output) {
    var top_level = node.expressions.map(function(expr) {
      var this_level = [];
      var this_node = util_handle_arbitrary_expr(
        expr,
        this_level);
      if (this_node) {
        if (util_need_expr_wrap(this_node)) {
          this_level = [util_wrap_expression(this_node)];
        } else {
          this_level = this_node;
        }
      } else {
        this_level = this_level.map(function(elt) {
          if (util_need_expr_wrap(elt)) {
            return util_wrap_expression(elt);
          } else {
            return elt;
          }
        });
      }
      return this_level;
    });
    // Flatten arrays.
    top_level = Array.prototype.concat.apply([], top_level);
    // All sequences have expressions as children.
    Array.prototype.push.apply(output, top_level);
  },

  /**
   * Handles conversion of a conditional expression into an if-else
   * statement. Return value not considered, ensure that this is not
   * after a statement requiring a right value.
   * @param  {ESNode} node - The conditional expression (ternary) node.
   * @return {ESNode} - The constructed if-else statement.
   */
  ternary: function(node) {
    var consequent, alternate;
    var consequent_statements = [];
    var alternate_statements = [];
    var c_node = util_handle_arbitrary_expr(
      node.consequent,
      consequent_statements);
    var a_node = util_handle_arbitrary_expr(
      node.alternate,
      alternate_statements);
    if (c_node) {
      if (util_is_expr(c_node)) {
        consequent_statements = [util_wrap_expression(c_node)];
      } else {
        consequent_statements = [c_node];
      }
      consequent = util_wrap_block_statement(consequent_statements);
    } else {
      consequent = util_wrap_block_statement(consequent_statements);
    }
    if (a_node) {
      if (util_is_expr(a_node)) {
        alternate_statements = [util_wrap_expression(a_node)];
        alternate = util_wrap_block_statement(alternate_statements);
      } else {
        alternate = a_node;
      }
    } else {
      alternate = util_wrap_block_statement(alternate_statements);
    }
    return util_if_statement(node.test, consequent, alternate);
  }
};

var escodegen = require('escodegen');
var name = require('./name');

module.exports = {
  'return > sequence': rewrite_return_sequence,
  'expr > ternary': rewrite_expr_ternary
};

// Fix case where there is a sequence with a parent return statement.
function rewrite_return_sequence(node) {
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
  parent.parent.update(escodegen.generate(parent.parent));
}

// Rewrite standalone short-circuit operators.
function rewrite_expr_binary(node) {
  var parent = node.parent;
  var context = parent.parent;
  var start = context.body.indexOf(parent);
  context.body[start] = write_expr_binary(node);
}

function rewrite_expr_ternary(node) {
  var parent = node.parent;
  // Return if there's no good context to insert into.
  if (!check_context(parent)) return;
  var context = parent.parent.body;
  var start = context.indexOf(parent);
  var generated = util_handle_arbitrary_expr(node);
  context[start] = generated;
  parent.parent.update(escodegen.generate(parent.parent));
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
  } else {
    console.log("BROKE");
    return false;
  }
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
  }
}

function write_expr_binary(node) {
  return util_if_statement(
    node.left,
    util_wrap_block_statement(
      util_handle_arbitrary_node(
        node.right,
        [])));
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

// Handle generic expression 
var ParseExpr = {
  /**
   * Turn a binary expression into an if/if-else. The 
   * @param  {ESNode} node - The binary expression.
   * @return {ESNode} - The constructed if statement.     [description]
   */
  binary: function(node) {
    return util_if_statement(
      node.left,
      util_wrap_block_statement(
        util_handle_arbitrary_expr(
          node.right,
          [])));
  },

  /**
   * Alters an array with the sequence expression values, appropriate
   * for placing in a statement body.
   * @param  {ESNode} node - The sequence expression node.
   * @param {Array} output - The array to output to.
   */
  sequence: function(node, output) {
    // All sequences have expressions as children.
    Array.prototype.push.apply(
      output,
      node.expressions.map(util_wrap_expression));
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
        consequent = util_wrap_block_statement(consequent_statements);
      } else {
        consequent = c_node;
      }
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
}

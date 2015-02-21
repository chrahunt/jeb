var escodegen = require('escodegen');
var name = require('./name');

module.exports = {
  'return > sequence': rewrite_return_sequence,
  'expr > binary': rewrite_expr_binary
};

// Fix case where there is a sequence with a parent return statement.
function rewrite_return_sequence(node) {
  var parent = node.parent;
  var context = parent.parent;
  var start = context.body.indexOf(parent);
  var return_expr = node.expressions.pop();
  // Put expressions into parent context.
  var output = [];
  ParseExpr[name[node.type]].call(null, node, output);
  Array.prototype.splice.apply(context.body,
    [start, 0].concat(output));
  // Rewrite return statement.
  parent.argument = return_expr;
  context.update(escodegen.generate(context));
}

// Rewrite standalone short-circuit operators.
function rewrite_expr_binary(node) {
  var parent = node.parent;
  var context = parent.parent;
  var start = context.body.indexOf(parent);
  context.body[start] = write_expr_binary(node);
}

function util_get_tag(node) {
  return lang(node);
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
  var id = lang.tag(node);
  if (ParseExpr.hasOwnProperty(id)) {
    return ParseExpr[lang.tag(node)].call(null, node, output);
  } else {
    return node;
  }
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
    return util_if_statement(
      node.test,
      util_wrap_block_statement(
        util_handle_arbitrary_expr(
          node.consequent,
          [])),
      util_wrap_block_statement(
        util_handle_arbitrary_expr(
          node.alternate,
          [])));
  }
}

/**
 * Disallow a JSX prop arrow function whose concise body is a `&&` guard
 * chain of 3+ operands (e.g. `onPress={() => !a && !b && doIt()}`) — extract
 * a named handler with early returns instead.
 */
const countAndChainOperands = (node, count = 0) => {
  if (node.type === "LogicalExpression" && node.operator === "&&") {
    return countAndChainOperands(node.right, countAndChainOperands(node.left, count));
  }
  return count + 1;
};

const noInlineGuardChainHandlerRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow a JSX prop arrow whose body is a long && guard chain",
    },
    schema: [],
    messages: {
      extractHandler:
        "JSX prop arrow guards with a {{count}}-term `&&` chain — extract a named handler with early returns.",
    },
  },
  create: (context) => {
    return {
      JSXAttribute(node) {
        const container = node.value;
        if (container?.type !== "JSXExpressionContainer") return;

        const expression = container.expression;
        if (expression.type !== "ArrowFunctionExpression") return;
        if (expression.body.type !== "LogicalExpression" || expression.body.operator !== "&&") return;

        const count = countAndChainOperands(expression.body);
        if (count < 3) return;

        context.report({ node: expression, messageId: "extractHandler", data: { count } });
      },
    };
  },
};

export default {
  rules: {
    "no-inline-guard-chain-handler": noInlineGuardChainHandlerRule,
  },
};

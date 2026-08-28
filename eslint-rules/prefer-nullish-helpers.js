/**
 * Disallow manual `x !== null && x !== undefined` / `x === null || x === undefined`
 * pairs against the same expression — prefer the `isNullish`/`isNotBlank`-style
 * helpers from `@lichens-innovation/ts-common`.
 */
const isNullOrUndefinedLiteral = (node) =>
  (node.type === "Literal" && node.value === null) || (node.type === "Identifier" && node.name === "undefined");

const matchesNullishComparison = (node, operator) =>
  node.type === "BinaryExpression" && node.operator === operator && isNullOrUndefinedLiteral(node.right);

const preferNullishHelpersRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer isNullish/!isNullish over a manual null-and-undefined comparison pair",
    },
    schema: [],
    messages: {
      preferNotNullish: "Manual `!== null && !== undefined` pair — use `!isNullish({{expr}})` instead.",
      preferNullish: "Manual `=== null || === undefined` pair — use `isNullish({{expr}})` instead.",
    },
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    const checkPair = (node, operator, logicalOperator, messageId) => {
      if (node.operator !== logicalOperator) return;
      if (!matchesNullishComparison(node.left, operator) || !matchesNullishComparison(node.right, operator)) return;

      const leftExpr = sourceCode.getText(node.left.left);
      const rightExpr = sourceCode.getText(node.right.left);
      if (leftExpr !== rightExpr) return;

      context.report({
        node,
        messageId,
        data: { expr: leftExpr },
      });
    };

    return {
      LogicalExpression(node) {
        checkPair(node, "!==", "&&", "preferNotNullish");
        checkPair(node, "===", "||", "preferNullish");
      },
    };
  },
};

export default {
  rules: {
    "prefer-nullish-helpers": preferNullishHelpersRule,
  },
};

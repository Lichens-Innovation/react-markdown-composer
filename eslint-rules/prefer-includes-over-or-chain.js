/**
 * Disallow `x === "a" || x === "b" || x === "c"` repeated-equality chains
 * against the same left-hand side — `["a","b","c"].includes(x)` says the
 * same thing without repeating the comparison target.
 */
const flattenOrChain = (node, operands) => {
  if (node.type === "LogicalExpression" && node.operator === "||") {
    flattenOrChain(node.left, operands);
    flattenOrChain(node.right, operands);
    return operands;
  }

  operands.push(node);
  return operands;
};

const isEqualityToLiteral = (node) =>
  node.type === "BinaryExpression" &&
  (node.operator === "===" || node.operator === "==") &&
  node.right.type === "Literal";

const preferIncludesOverOrChainRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer Array#includes over a chain of === comparisons against the same value",
    },
    fixable: "code",
    schema: [],
    messages: {
      preferIncludes: "Repeated equality checks against the same value — use `[...].includes(...)` instead.",
    },
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      LogicalExpression(node) {
        if (node.operator !== "||") return;
        if (node.parent.type === "LogicalExpression" && node.parent.operator === "||") return; // only report the outermost chain

        const operands = flattenOrChain(node, []);
        if (operands.length < 2) return;
        if (!operands.every(isEqualityToLiteral)) return;

        const lhsTexts = operands.map((operand) => sourceCode.getText(operand.left));
        const [firstLhs] = lhsTexts;
        if (!lhsTexts.every((text) => text === firstLhs)) return;

        context.report({
          node,
          messageId: "preferIncludes",
          fix: (fixer) => {
            const literalsText = operands.map((operand) => sourceCode.getText(operand.right)).join(", ");
            return fixer.replaceText(node, `[${literalsText}].includes(${firstLhs})`);
          },
        });
      },
    };
  },
};

export default {
  rules: {
    "prefer-includes-over-or-chain": preferIncludesOverOrChainRule,
  },
};

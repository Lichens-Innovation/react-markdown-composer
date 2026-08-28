/**
 * Require a `?? fallback` after an optional-chain expression that is at
 * least `minDepth` `?.` segments deep — a long dangling optional chain
 * with no fallback usually means an implicit `undefined` leaks further
 * than intended.
 */
const countOptionalDepth = (node) => {
  let depth = 0;
  let current = node;

  while (current) {
    if (current.type === "MemberExpression" || current.type === "CallExpression") {
      if (current.optional) depth += 1;
      current = current.type === "CallExpression" ? current.callee : current.object;
      continue;
    }
    break;
  }

  return depth;
};

const endsWithNullishFallback = (node) =>
  node.parent.type === "LogicalExpression" && node.parent.operator === "??" && node.parent.left === node;

const requireFallbackOnDeepChainRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require a ?? fallback on a deep optional chain",
    },
    schema: [
      {
        type: "object",
        properties: { minDepth: { type: "integer", minimum: 2 } },
        additionalProperties: false,
      },
    ],
    messages: {
      requireFallback: "Optional chain is {{depth}} levels deep with no `?? fallback` — add one.",
    },
  },
  create: (context) => {
    const minDepth = context.options[0]?.minDepth ?? 3;

    return {
      ChainExpression(node) {
        const depth = countOptionalDepth(node.expression);
        if (depth < minDepth) return;
        if (endsWithNullishFallback(node)) return;

        context.report({ node, messageId: "requireFallback", data: { depth } });
      },
    };
  },
};

export default {
  rules: {
    "require-fallback-on-deep-chain": requireFallbackOnDeepChainRule,
  },
};

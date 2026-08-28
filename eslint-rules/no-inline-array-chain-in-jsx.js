/**
 * Disallow chaining 2+ array methods (filter/sort/map/reduce) directly
 * inside a JSX expression container — precompute the list with imported
 * helpers instead.
 */
const CHAINABLE_METHODS = new Set(["filter", "sort", "map", "reduce"]);

const countChainedArrayCalls = (node) => {
  let count = 0;
  let current = node;

  while (current?.type === "CallExpression") {
    const callee = current.callee;
    if (callee.type !== "MemberExpression" || callee.computed) break;
    if (!CHAINABLE_METHODS.has(callee.property.name)) break;

    count += 1;
    current = callee.object;
  }

  return count;
};

const noInlineArrayChainInJsxRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow chained array methods directly inside a JSX expression",
    },
    schema: [],
    messages: {
      precompute: "Chained {{count}} array methods inline in JSX — precompute the list with an imported helper.",
    },
  },
  create: (context) => {
    return {
      JSXExpressionContainer(node) {
        const expression = node.expression;
        if (expression.type !== "CallExpression") return;

        const count = countChainedArrayCalls(expression);
        if (count < 2) return;

        context.report({ node: expression, messageId: "precompute", data: { count } });
      },
    };
  },
};

export default {
  rules: {
    "no-inline-array-chain-in-jsx": noInlineArrayChainInJsxRule,
  },
};

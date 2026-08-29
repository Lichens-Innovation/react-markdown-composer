/**
 * Disallow useMemo around a body with no function call inside — memoizing a
 * primitive/trivial expression costs more (the memo machinery itself) than
 * just recomputing it on every render.
 */
const containsCallExpression = (node) => {
  if (!node || typeof node.type !== "string") return false;
  if (node.type === "CallExpression" || node.type === "NewExpression") return true;

  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      if (value.some((child) => child && typeof child.type === "string" && containsCallExpression(child))) {
        return true;
      }
    } else if (value && typeof value.type === "string" && containsCallExpression(value)) {
      return true;
    }
  }

  return false;
};

const noTrivialUsememoRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow useMemo whose body has no function call (likely unnecessary memoization)",
    },
    schema: [],
    messages: {
      unnecessaryMemo: "useMemo body has no function call inside — likely too trivial to be worth memoizing.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "useMemo") return;

        const [callback] = node.arguments;
        if (!callback || callback.type !== "ArrowFunctionExpression") return;

        const bodyToCheck =
          callback.body.type === "BlockStatement"
            ? callback.body.body.find((s) => s.type === "ReturnStatement")?.argument
            : callback.body;

        if (!bodyToCheck) return;
        if (containsCallExpression(bodyToCheck)) return;

        context.report({ node, messageId: "unnecessaryMemo" });
      },
    };
  },
};

export default {
  rules: {
    "no-trivial-usememo": noTrivialUsememoRule,
  },
};

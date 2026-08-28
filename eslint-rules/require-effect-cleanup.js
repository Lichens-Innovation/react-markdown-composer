/**
 * Require a useEffect that registers an interval/timeout/listener/subscription
 * to return a cleanup function that tears it down.
 */
const RISKY_CALL_NAMES = new Set(["setInterval", "setTimeout", "addEventListener", "subscribe"]);

const isRiskyRegistration = (node) => {
  if (node.type !== "CallExpression") return false;
  if (node.callee.type === "Identifier") return RISKY_CALL_NAMES.has(node.callee.name);
  if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
    return RISKY_CALL_NAMES.has(node.callee.property.name);
  }
  return false;
};

const containsRiskyRegistration = (node) => {
  if (!node || typeof node.type !== "string") return false;
  if (isRiskyRegistration(node)) return true;
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "FunctionExpression" ||
    node.type === "ArrowFunctionExpression"
  ) {
    return false; // don't descend into nested (already independently-scoped) functions
  }

  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      if (value.some((child) => child && typeof child.type === "string" && containsRiskyRegistration(child))) {
        return true;
      }
    } else if (value && typeof value.type === "string" && containsRiskyRegistration(value)) {
      return true;
    }
  }

  return false;
};

const hasCleanupReturn = (blockStatement) =>
  blockStatement.body.some(
    (statement) =>
      statement.type === "ReturnStatement" &&
      statement.argument &&
      (statement.argument.type === "ArrowFunctionExpression" || statement.argument.type === "FunctionExpression")
  );

const requireEffectCleanupRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require a cleanup return from a useEffect that registers a timer/listener/subscription",
    },
    schema: [],
    messages: {
      requireCleanup: "This effect registers a {{what}} but returns no cleanup function to tear it down.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "useEffect") return;

        const [callback] = node.arguments;
        if (!callback || callback.body.type !== "BlockStatement") return;
        if (!containsRiskyRegistration(callback.body)) return;
        if (hasCleanupReturn(callback.body)) return;

        context.report({ node, messageId: "requireCleanup", data: { what: "interval/listener/subscription" } });
      },
    };
  },
};

export default {
  rules: {
    "require-effect-cleanup": requireEffectCleanupRule,
  },
};

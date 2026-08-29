/**
 * Disallow `JSON.parse(...)` outside a `try` block — a malformed payload
 * should not be able to throw uncaught.
 */
const isJsonParseCall = (node) =>
  node.type === "CallExpression" &&
  node.callee.type === "MemberExpression" &&
  node.callee.object.type === "Identifier" &&
  node.callee.object.name === "JSON" &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "parse";

/** Walk up from `node`, stopping at the first TryStatement/function boundary encountered. */
const isInsideTryBlock = (node) => {
  let current = node;
  let previous = null;

  while (current) {
    if (current.type === "TryStatement" && previous === current.block) return true;
    if (
      current.type === "FunctionDeclaration" ||
      current.type === "FunctionExpression" ||
      current.type === "ArrowFunctionExpression"
    ) {
      return false;
    }

    previous = current;
    current = current.parent;
  }

  return false;
};

const noUnguardedJsonParseRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require JSON.parse(...) to be wrapped in a try/catch",
    },
    schema: [],
    messages: {
      unguarded: "JSON.parse(...) can throw on malformed input — wrap it in a try/catch.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (!isJsonParseCall(node)) return;
        if (isInsideTryBlock(node)) return;

        context.report({ node, messageId: "unguarded" });
      },
    };
  },
};

export default {
  rules: {
    "no-unguarded-json-parse": noUnguardedJsonParseRule,
  },
};

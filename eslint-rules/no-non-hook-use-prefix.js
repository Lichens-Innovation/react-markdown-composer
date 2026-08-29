/**
 * Disallow naming a function `use[A-Z]...` when its body calls no hook —
 * a plain function should have an action-verb name, not a hook name.
 */
const HOOK_NAME_RE = /^use[A-Z]/;

const callsAHook = (node) => {
  if (!node || typeof node.type !== "string") return false;
  if (node.type === "CallExpression" && node.callee.type === "Identifier" && HOOK_NAME_RE.test(node.callee.name)) {
    return true;
  }

  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    const value = node[key];
    if (Array.isArray(value)) {
      if (value.some((child) => child && typeof child.type === "string" && callsAHook(child))) return true;
    } else if (value && typeof value.type === "string" && callsAHook(value)) {
      return true;
    }
  }

  return false;
};

const noNonHookUsePrefixRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow a use* named function whose body calls no hook",
    },
    schema: [],
    messages: {
      misnamed: "'{{name}}' is named like a hook but calls no hook internally — rename it to a plain action verb.",
    },
  },
  create: (context) => {
    const checkFunction = (node, name) => {
      if (!name || !HOOK_NAME_RE.test(name)) return;
      if (callsAHook(node.body)) return;

      context.report({ node, messageId: "misnamed", data: { name } });
    };

    return {
      FunctionDeclaration(node) {
        checkFunction(node, node.id?.name);
      },
      "VariableDeclarator > ArrowFunctionExpression"(node) {
        checkFunction(node, node.parent.id?.type === "Identifier" ? node.parent.id.name : undefined);
      },
    };
  },
};

export default {
  rules: {
    "no-non-hook-use-prefix": noNonHookUsePrefixRule,
  },
};

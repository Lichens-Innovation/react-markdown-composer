/**
 * Disallow a `use[A-Z]...` hook returning JSX — a hook should return data,
 * the calling component should own rendering.
 */
const HOOK_NAME_RE = /^use[A-Z]/;

const returnsJsxDirectly = (functionNode) => {
  let found = false;

  const visit = (node) => {
    if (!node || typeof node.type !== "string" || found) return;
    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression"
    ) {
      if (node !== functionNode) return; // don't descend into nested function bodies
    }

    if (node.type === "ReturnStatement" && node.argument) {
      if (node.argument.type === "JSXElement" || node.argument.type === "JSXFragment") {
        found = true;
        return;
      }
    }

    for (const key of Object.keys(node)) {
      if (key === "parent") continue;
      const value = node[key];
      if (Array.isArray(value)) {
        value.forEach((child) => child && typeof child.type === "string" && visit(child));
      } else if (value && typeof value.type === "string") {
        visit(value);
      }
    }
  };

  if (functionNode.body.type === "JSXElement" || functionNode.body.type === "JSXFragment") return true;
  visit(functionNode.body);
  return found;
};

const noHookReturningJsxRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow a use* hook returning JSX",
    },
    schema: [],
    messages: {
      hookReturnsJsx: "'{{name}}' is named like a hook but returns JSX — hooks should return data, not markup.",
    },
  },
  create: (context) => {
    const checkFunction = (node, name) => {
      if (!name || !HOOK_NAME_RE.test(name)) return;
      if (!returnsJsxDirectly(node)) return;

      context.report({ node, messageId: "hookReturnsJsx", data: { name } });
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
    "no-hook-returning-jsx": noHookReturningJsxRule,
  },
};

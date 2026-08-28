/**
 * Disallow `setX(expr)` where `expr` references the paired state variable
 * directly instead of using the updater-function form `setX((current) => ...)`.
 */
const decapitalize = (name) => name.charAt(0).toLowerCase() + name.slice(1);

/** Skip AST fields that hold a property/method *name* rather than a variable reference. */
const isNonReferencePosition = (node, key) => {
  if ((node.type === "MemberExpression" || node.type === "MethodDefinition") && key === "property" && !node.computed) {
    return true;
  }
  if (node.type === "Property" && key === "key" && !node.computed) return true;
  return false;
};

const referencesIdentifier = (node, name) => {
  if (!node || typeof node.type !== "string") return false;
  if (node.type === "Identifier" && node.name === name) return true;

  for (const key of Object.keys(node)) {
    if (key === "parent" || isNonReferencePosition(node, key)) continue;
    const value = node[key];
    if (Array.isArray(value)) {
      if (value.some((child) => child && typeof child.type === "string" && referencesIdentifier(child, name))) {
        return true;
      }
    } else if (value && typeof value.type === "string" && referencesIdentifier(value, name)) {
      return true;
    }
  }

  return false;
};

const preferStateUpdaterFormRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer the updater-function form of a state setter when the new value depends on the current one",
    },
    schema: [],
    messages: {
      preferUpdaterForm:
        "'{{setter}}' argument references '{{state}}' directly — use the updater form `{{setter}}((current) => ...)` instead.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !/^set[A-Z]/.test(node.callee.name)) return;
        if (node.arguments.length !== 1) return;

        const [arg] = node.arguments;
        if (arg.type === "ArrowFunctionExpression" || arg.type === "FunctionExpression") return; // already updater form

        const stateName = decapitalize(node.callee.name.slice("set".length));
        if (!referencesIdentifier(arg, stateName)) return;

        context.report({
          node,
          messageId: "preferUpdaterForm",
          data: { setter: node.callee.name, state: stateName },
        });
      },
    };
  },
};

export default {
  rules: {
    "prefer-state-updater-form": preferStateUpdaterFormRule,
  },
};

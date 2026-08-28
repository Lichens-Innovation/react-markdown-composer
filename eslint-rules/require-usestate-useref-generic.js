/**
 * Require an explicit type argument on `useState()`/`useRef()` when the
 * initial value can't infer a useful type on its own (no argument, or a
 * bare `null`/`undefined`).
 */
const HOOK_NAMES = new Set(["useState", "useRef"]);

const hasTypeArguments = (node) => {
  const typeArgs = node.typeArguments ?? node.typeParameters;
  return !!typeArgs && typeArgs.params.length > 0;
};

const hasUninferableInitialValue = (node) => {
  if (node.arguments.length === 0) return true;
  const [arg] = node.arguments;
  return (arg.type === "Literal" && arg.value === null) || (arg.type === "Identifier" && arg.name === "undefined");
};

const requireUsestateUserefGenericRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require an explicit generic on useState()/useRef() when the initial value can't infer one",
    },
    schema: [],
    messages: {
      requireGeneric: "'{{name}}()' has no inferable type from its initial value — add an explicit `<Type>` generic.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !HOOK_NAMES.has(node.callee.name)) return;
        if (hasTypeArguments(node)) return;
        if (!hasUninferableInitialValue(node)) return;

        context.report({ node, messageId: "requireGeneric", data: { name: node.callee.name } });
      },
    };
  },
};

export default {
  rules: {
    "require-usestate-useref-generic": requireUsestateUserefGenericRule,
  },
};

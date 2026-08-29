/**
 * Disallow wrapping a JSX-returning (or render*-named) function in
 * useCallback — extract a subcomponent instead, and reserve useCallback
 * for actual event-handler functions.
 */
const RENDER_NAME_RE = /^render/i;

const callbackReturnsJsx = (fn) => {
  if (!fn) return false;
  if (fn.body.type === "JSXElement" || fn.body.type === "JSXFragment") return true;
  if (fn.body.type !== "BlockStatement") return false;

  return fn.body.body.some(
    (statement) =>
      statement.type === "ReturnStatement" &&
      statement.argument &&
      (statement.argument.type === "JSXElement" || statement.argument.type === "JSXFragment")
  );
};

const noRenderFnInUsecallbackRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow useCallback wrapping a JSX-returning or render*-named function",
    },
    schema: [],
    messages: {
      extractSubcomponent:
        "useCallback wraps a render function — extract a `<Component />` instead; reserve useCallback for event handlers.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || node.callee.name !== "useCallback") return;

        const [callback] = node.arguments;
        if (!callback || (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression")) {
          return;
        }

        const declarator = node.parent.type === "VariableDeclarator" ? node.parent : null;
        const boundName = declarator?.id.type === "Identifier" ? declarator.id.name : "";

        if (!callbackReturnsJsx(callback) && !RENDER_NAME_RE.test(boundName)) return;

        context.report({ node, messageId: "extractSubcomponent" });
      },
    };
  },
};

export default {
  rules: {
    "no-render-fn-in-usecallback": noRenderFnInUsecallbackRule,
  },
};

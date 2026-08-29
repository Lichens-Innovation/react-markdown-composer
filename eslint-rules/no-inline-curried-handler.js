/**
 * Disallow declaring a curried handler factory ((id) => () => fn(id)) as a
 * local variable inside a component — move pure factories to *.utils.ts,
 * keep inline arrows to one-liners.
 */
const isCurriedArrow = (node) => {
  if (node.type !== "ArrowFunctionExpression") return false;
  if (node.body.type === "ArrowFunctionExpression") return true;
  if (node.body.type !== "BlockStatement") return false;

  return node.body.body.some(
    (statement) => statement.type === "ReturnStatement" && statement.argument?.type === "ArrowFunctionExpression"
  );
};

const noInlineCurriedHandlerRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow a curried handler factory declared as a local component variable",
    },
    schema: [],
    messages: {
      extractToUtils:
        "'{{name}}' is a curried handler factory declared inside a component — move it to a *.utils.ts file.",
    },
  },
  create: (context) => {
    return {
      VariableDeclarator(node) {
        if (!node.init || !isCurriedArrow(node.init)) return;
        if (node.id.type !== "Identifier") return;

        const scope = context.sourceCode.getScope(node);
        if (scope.type !== "function") return; // module-scope factories are fine

        context.report({ node, messageId: "extractToUtils", data: { name: node.id.name } });
      },
    };
  },
};

export default {
  rules: {
    "no-inline-curried-handler": noInlineCurriedHandlerRule,
  },
};

/**
 * Disallow a `try` statement nested inside another `try` block or `catch`
 * handler of the same function — flatten into one try/catch instead.
 */
const noNestedTryRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow nesting a try statement inside another try block or catch handler",
    },
    schema: [],
    messages: {
      nestedTry: "Nested try/catch — flatten into a single try/catch that handles both error paths.",
    },
  },
  create: (context) => {
    return {
      TryStatement(node) {
        let previous = node;
        let current = node.parent;

        while (current) {
          if (
            current.type === "FunctionDeclaration" ||
            current.type === "FunctionExpression" ||
            current.type === "ArrowFunctionExpression"
          ) {
            return;
          }

          if (current.type === "TryStatement" && (previous === current.block || previous === current.handler)) {
            context.report({ node, messageId: "nestedTry" });
            return;
          }

          previous = current;
          current = current.parent;
        }
      },
    };
  },
};

export default {
  rules: {
    "no-nested-try": noNestedTryRule,
  },
};

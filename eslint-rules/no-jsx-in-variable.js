/**
 * Disallow assigning a JSX element/fragment to a variable and injecting it
 * into the return later — declare a small named component instead.
 */
const noJsxInVariableRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow storing a JSX element/fragment in a variable",
    },
    schema: [],
    messages: {
      declareComponent: "JSX stored in a variable — declare a small named component with explicit props instead.",
    },
  },
  create: (context) => {
    return {
      VariableDeclarator(node) {
        if (!node.init) return;
        if (node.init.type !== "JSXElement" && node.init.type !== "JSXFragment") return;

        context.report({ node, messageId: "declareComponent" });
      },
    };
  },
};

export default {
  rules: {
    "no-jsx-in-variable": noJsxInVariableRule,
  },
};

/**
 * Disallow an inline object-literal type annotation on a function parameter
 * (`({ a, b }: { a: string; b: number }) => ...`) — extract a named interface
 * above the function instead.
 */
const noInlineObjectParamTypeRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow inline object type literals on function parameters",
    },
    schema: [],
    messages: {
      extractInterface: "Inline object type on this parameter — extract a named `interface` above the function.",
    },
  },
  create: (context) => {
    const checkParam = (param) => {
      const typeAnnotation = param.typeAnnotation?.typeAnnotation;
      if (typeAnnotation?.type === "TSTypeLiteral") {
        context.report({ node: typeAnnotation, messageId: "extractInterface" });
      }
    };

    const checkFunction = (node) => {
      node.params.forEach(checkParam);
    };

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};

export default {
  rules: {
    "no-inline-object-param-type": noInlineObjectParamTypeRule,
  },
};

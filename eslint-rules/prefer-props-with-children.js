/**
 * Disallow hand-declaring a `children: ReactNode` property on a props
 * interface — use `PropsWithChildren<Props>` instead.
 */
const preferPropsWithChildrenRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer PropsWithChildren<Props> over a hand-declared children property",
    },
    schema: [],
    messages: {
      preferPropsWithChildren:
        "'{{name}}' hand-declares a `children` property — wrap the props type in `PropsWithChildren<...>` instead.",
    },
  },
  create: (context) => {
    return {
      TSInterfaceDeclaration(node) {
        const childrenProperty = node.body.body.find(
          (member) =>
            member.type === "TSPropertySignature" && member.key.type === "Identifier" && member.key.name === "children"
        );
        if (!childrenProperty) return;

        context.report({
          node: childrenProperty,
          messageId: "preferPropsWithChildren",
          data: { name: node.id.name },
        });
      },
    };
  },
};

export default {
  rules: {
    "prefer-props-with-children": preferPropsWithChildrenRule,
  },
};

/**
 * Require every enum member to have an explicit initializer, instead of
 * relying on implicit auto-incrementing ordinals (`enum Foo { A, B }`).
 * String enum members already require an initializer at the TS level, so
 * this only ever fires on numeric/computed members.
 */
const requireNumericEnumInitializerRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require an explicit initializer on every enum member",
    },
    schema: [],
    messages: {
      missingInitializer: "Enum member '{{name}}' has no explicit initializer — assign an explicit value.",
    },
  },
  create: (context) => {
    return {
      TSEnumMember(node) {
        if (node.initializer) return;

        const name = node.id.type === "Identifier" ? node.id.name : context.sourceCode.getText(node.id);
        context.report({
          node,
          messageId: "missingInitializer",
          data: { name },
        });
      },
    };
  },
};

export default {
  rules: {
    "require-numeric-enum-initializer": requireNumericEnumInitializerRule,
  },
};

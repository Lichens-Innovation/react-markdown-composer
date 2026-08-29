/**
 * Disallow Testing Library's *ByTestId queries — prefer the semantic,
 * accessible *ByRole queries.
 */
const TESTID_QUERY_RE = /^(get|query|find)(All)?ByTestId$/;

const preferRoleQueryOverTestidRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer Testing Library's *ByRole queries over *ByTestId",
    },
    schema: [],
    messages: {
      preferRole: "'{{name}}' — prefer the equivalent `*ByRole` query for a semantic, accessible selector.",
    },
  },
  create: (context) => {
    const checkName = (node, name) => {
      if (!TESTID_QUERY_RE.test(name)) return;
      context.report({ node, messageId: "preferRole", data: { name } });
    };

    return {
      CallExpression(node) {
        if (node.callee.type === "Identifier") {
          checkName(node, node.callee.name);
        } else if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
          checkName(node.callee.property, node.callee.property.name);
        }
      },
    };
  },
};

export default {
  rules: {
    "prefer-role-query-over-testid": preferRoleQueryOverTestidRule,
  },
};

/**
 * Disallow `export let` / `export var` at module scope — mutable exported
 * bindings let any importer silently mutate shared state from outside.
 */
const noExportedMutableStateRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow exporting a mutable (let/var) module-scoped binding",
    },
    schema: [],
    messages: {
      noMutableExport: "Do not export a mutable ({{kind}}) binding — export a const, or a getter/setter pair.",
    },
  },
  create: (context) => {
    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration;
        if (!declaration || declaration.type !== "VariableDeclaration") return;
        if (declaration.kind === "const") return;

        context.report({
          node,
          messageId: "noMutableExport",
          data: { kind: declaration.kind },
        });
      },
    };
  },
};

export default {
  rules: {
    "no-exported-mutable-state": noExportedMutableStateRule,
  },
};

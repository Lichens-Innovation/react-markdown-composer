/**
 * Disallow test files living inside a `__tests__` folder — colocate
 * `*.test.ts(x)` next to the source file instead.
 */
const noTestsInDunderFolderRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow test files inside a __tests__ folder",
    },
    schema: [],
    messages: {
      colocate: "This test lives in a `__tests__` folder — colocate it as `*.test.ts(x)` next to its source file.",
    },
  },
  create: (context) => {
    return {
      Program(node) {
        const filename = context.filename.replaceAll("\\", "/");
        if (!filename.includes("/__tests__/")) return;

        context.report({ node, messageId: "colocate" });
      },
    };
  },
};

export default {
  rules: {
    "no-tests-in-dunder-folder": noTestsInDunderFolderRule,
  },
};

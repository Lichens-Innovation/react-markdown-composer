/**
 * Disallow a `JSX.Element | null | undefined`-style union prop type —
 * `ReactNode` says the same thing and is the idiomatic type for "anything
 * renderable".
 */
const isJsxElementOrReactElementType = (node) => {
  if (node.type !== "TSTypeReference") return false;
  const typeName = node.typeName;

  if (typeName.type === "TSQualifiedName") {
    return typeName.left.type === "Identifier" && typeName.left.name === "JSX" && typeName.right.name === "Element";
  }

  return typeName.type === "Identifier" && (typeName.name === "ReactElement" || typeName.name === "JSX.Element");
};

const isNullOrUndefinedKeyword = (node) => node.type === "TSNullKeyword" || node.type === "TSUndefinedKeyword";

const hasReactNodeImported = (program) =>
  program.body.some(
    (statement) =>
      statement.type === "ImportDeclaration" &&
      statement.source.value === "react" &&
      statement.specifiers.some(
        (specifier) => specifier.type === "ImportSpecifier" && specifier.imported.name === "ReactNode"
      )
  );

const preferReactnodeOverJsxelementUnionRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer ReactNode over a JSX.Element | null | undefined union",
    },
    fixable: "code",
    schema: [],
    messages: {
      preferReactNode: "Use `ReactNode` instead of a `JSX.Element`/`ReactElement` union with null/undefined.",
    },
  },
  create: (context) => {
    return {
      TSUnionType(node) {
        const hasElementType = node.types.some(isJsxElementOrReactElementType);
        const hasNullish = node.types.some(isNullOrUndefinedKeyword);
        if (!hasElementType || !hasNullish) return;

        const canAutofix = hasReactNodeImported(context.sourceCode.ast);

        context.report({
          node,
          messageId: "preferReactNode",
          fix: canAutofix ? (fixer) => fixer.replaceText(node, "ReactNode") : undefined,
        });
      },
    };
  },
};

export default {
  rules: {
    "prefer-reactnode-over-jsxelement-union": preferReactnodeOverJsxelementUnionRule,
  },
};

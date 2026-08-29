/**
 * Disallow `.find(cb) !== undefined` / `.find(cb) === undefined` / `!arr.find(cb)`
 * existence checks — `.some(cb)` says the same thing without allocating/keeping
 * the found element only to discard it.
 */
const isFindCall = (node) =>
  node.type === "CallExpression" &&
  node.callee.type === "MemberExpression" &&
  !node.callee.computed &&
  node.callee.property.type === "Identifier" &&
  node.callee.property.name === "find";

const toSomeCallText = (findCallNode, sourceCode) => {
  const calleeText = sourceCode.getText(findCallNode.callee.object);
  const argsText = findCallNode.arguments.map((arg) => sourceCode.getText(arg)).join(", ");
  return `${calleeText}.some(${argsText})`;
};

const preferSomeOverFindCheckRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer Array#some over comparing Array#find's result to undefined",
    },
    fixable: "code",
    schema: [],
    messages: {
      preferSome: "Use `.some(...)` instead of comparing `.find(...)` to undefined for an existence check.",
    },
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      BinaryExpression(node) {
        if (node.operator !== "!==" && node.operator !== "===") return;

        const [findSide, otherSide] =
          node.left.type === "CallExpression" ? [node.left, node.right] : [node.right, node.left];

        if (!isFindCall(findSide)) return;
        if (otherSide.type !== "Identifier" || otherSide.name !== "undefined") return;

        const negate = node.operator === "===";

        context.report({
          node,
          messageId: "preferSome",
          fix: (fixer) => {
            const someText = toSomeCallText(findSide, sourceCode);
            return fixer.replaceText(node, negate ? `!${someText}` : someText);
          },
        });
      },
      UnaryExpression(node) {
        if (node.operator !== "!" || !node.prefix) return;
        if (!isFindCall(node.argument)) return;

        context.report({
          node,
          messageId: "preferSome",
          fix: (fixer) => fixer.replaceText(node, `!${toSomeCallText(node.argument, sourceCode)}`),
        });
      },
    };
  },
};

export default {
  rules: {
    "prefer-some-over-find-check": preferSomeOverFindCheckRule,
  },
};

/**
 * Prefer `{cond && <X/>}` over `{cond ? <X/> : null}` in JSX children, and
 * require a boolean left side (`!!value`, `length > 0`, or an already-boolean
 * expression) so `0` / `""` cannot leak into the page.
 */
import ts from "typescript";

const BOOLEANISH_FLAGS =
  ts.TypeFlags.Boolean |
  ts.TypeFlags.BooleanLiteral |
  ts.TypeFlags.Null |
  ts.TypeFlags.Undefined |
  ts.TypeFlags.Void |
  ts.TypeFlags.Never;

const unwrap = (node) => {
  let current = node;
  while (current) {
    if (
      current.type === "ParenthesizedExpression" ||
      current.type === "TSAsExpression" ||
      current.type === "TSSatisfiesExpression" ||
      current.type === "TSTypeAssertion" ||
      current.type === "TSNonNullExpression"
    ) {
      current = current.expression;
      continue;
    }
    if (current.type === "ChainExpression") {
      current = current.expression;
      continue;
    }
    break;
  }
  return current;
};

const isJsxNode = (node) => {
  if (!node) return false;
  if (node.type === "JSXElement" || node.type === "JSXFragment") return true;
  if (node.type === "ParenthesizedExpression") return isJsxNode(node.expression);
  return false;
};

const isJsxChildExpression = (node) => {
  const container = node.parent;
  if (container?.type !== "JSXExpressionContainer") return false;
  const grandparent = container.parent;
  return grandparent?.type === "JSXElement" || grandparent?.type === "JSXFragment";
};

const isDiscardedNode = (node) => {
  const inner = unwrap(node);
  if (inner.type === "Literal" && (inner.value === null || inner.value === false)) return true;
  return inner.type === "Identifier" && inner.name === "undefined";
};

const isLengthAccess = (node) => {
  const inner = unwrap(node);
  return (
    inner.type === "MemberExpression" &&
    !inner.computed &&
    inner.property.type === "Identifier" &&
    inner.property.name === "length"
  );
};

const isSyntacticallyBoolean = (node) => {
  const inner = unwrap(node);
  if (inner.type === "UnaryExpression" && inner.operator === "!") return true;
  if (inner.type === "BinaryExpression") return true;
  if (inner.type === "CallExpression") return true;
  if (inner.type === "Literal" && typeof inner.value === "boolean") return true;
  if (inner.type === "LogicalExpression" && inner.operator === "&&") {
    return isSyntacticallyBoolean(inner.left) && isSyntacticallyBoolean(inner.right);
  }
  return false;
};

const isBooleanishType = (type) => {
  if (!type) return false;
  if (type.flags & BOOLEANISH_FLAGS) return true;
  if (typeof type.isUnion === "function" && type.isUnion()) {
    return type.types.every(isBooleanishType);
  }
  return false;
};

const getTypeAtNode = (context, node) => {
  try {
    const services = context.sourceCode?.parserServices ?? context.parserServices;
    if (!services?.program || !services.esTreeNodeToTSNodeMap) return;
    const tsNode = services.esTreeNodeToTSNodeMap.get(node);
    if (!tsNode) return;
    return services.program.getTypeChecker().getTypeAtLocation(tsNode);
  } catch {
    return;
  }
};

const needsBooleanCoerce = (context, node) => {
  if (isSyntacticallyBoolean(node)) return false;
  if (isLengthAccess(node)) return true;

  const type = getTypeAtNode(context, node);
  if (type) return !isBooleanishType(type);

  const inner = unwrap(node);
  if (inner.type === "Identifier") return false;
  if (inner.type === "Literal" && typeof inner.value === "boolean") return false;
  return inner.type !== "JSXElement" && inner.type !== "JSXFragment";
};

const coerceText = (node, sourceCode) => {
  const text = sourceCode.getText(node);
  if (isLengthAccess(node)) return `${text} > 0`;
  const inner = unwrap(node);
  if (inner.type === "Identifier" || inner.type === "MemberExpression" || inner.type === "ChainExpression") {
    return `!!${text}`;
  }
  return `!!(${text})`;
};

const collectNonJsxAndLeaves = (node) => {
  if (isJsxNode(node)) return [];
  if (node.type === "LogicalExpression" && node.operator === "&&") {
    return [...collectNonJsxAndLeaves(node.left), ...collectNonJsxAndLeaves(node.right)];
  }
  return [node];
};

const getTextPreservingParens = (sourceCode, node) => {
  const tokenBefore = sourceCode.getTokenBefore(node);
  const tokenAfter = sourceCode.getTokenAfter(node);
  if (tokenBefore?.value === "(" && tokenAfter?.value === ")") {
    return sourceCode.text.slice(tokenBefore.range[0], tokenAfter.range[1]);
  }
  return sourceCode.getText(node);
};

const formatBooleanTest = (context, sourceCode, node) => {
  if (node.type === "LogicalExpression" && node.operator === "&&") {
    return `${formatBooleanTest(context, sourceCode, node.left)} && ${formatBooleanTest(context, sourceCode, node.right)}`;
  }
  if (needsBooleanCoerce(context, node)) return coerceText(node, sourceCode);
  return sourceCode.getText(node);
};

const preferJsxShortCircuitRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prefer && short-circuit for optional JSX, with a boolean left side",
    },
    fixable: "code",
    schema: [],
    messages: {
      preferShortCircuit: "Use `&&` short-circuit instead of `cond ? jsx : null` for optional rendering.",
      requireBooleanGuard:
        "Left side of `&&` in JSX may leak a non-boolean value — use `!!value` or a boolean comparison.",
    },
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      "JSXExpressionContainer > ConditionalExpression"(node) {
        if (!isJsxChildExpression(node)) return;
        if (!isJsxNode(node.consequent) || !isDiscardedNode(node.alternate)) return;

        context.report({
          node,
          messageId: "preferShortCircuit",
          fix: (fixer) => {
            const testText = formatBooleanTest(context, sourceCode, node.test);
            const consequentText = getTextPreservingParens(sourceCode, node.consequent);
            return fixer.replaceText(node, `${testText} && ${consequentText}`);
          },
        });
      },

      "JSXExpressionContainer > LogicalExpression[operator='&&']"(node) {
        if (!isJsxChildExpression(node)) return;

        for (const leaf of collectNonJsxAndLeaves(node)) {
          if (!needsBooleanCoerce(context, leaf)) continue;

          context.report({
            node: leaf,
            messageId: "requireBooleanGuard",
            fix: (fixer) => fixer.replaceText(leaf, coerceText(leaf, sourceCode)),
          });
        }
      },
    };
  },
};

export default {
  rules: {
    "prefer-jsx-short-circuit": preferJsxShortCircuitRule,
  },
};

/**
 * Disallow a const array/object literal declared inside a component with no
 * dependency on the component's own scope (props, state, closures) — hoist
 * it to module scope so it isn't recreated on every render.
 */
const isLiteralCollection = (node) => node?.type === "ArrayExpression" || node?.type === "ObjectExpression";

/** True if any identifier referenced inside `node` resolves to a binding local to `functionScope`. */
const referencesLocalBinding = (node, functionScope, sourceCode) => {
  let found = false;

  const visit = (current) => {
    if (!current || typeof current.type !== "string" || found) return;

    if (current.type === "Identifier") {
      const scope = sourceCode.getScope(current);
      const reference = scope.references.find((ref) => ref.identifier === current);
      const variable = reference?.resolved;
      if (variable && isDescendantScope(variable.scope, functionScope)) {
        found = true;
      }
      return;
    }

    for (const key of Object.keys(current)) {
      if (key === "parent") continue;
      const value = current[key];
      if (Array.isArray(value)) {
        value.forEach((child) => child && typeof child.type === "string" && visit(child));
      } else if (value && typeof value.type === "string") {
        visit(value);
      }
    }
  };

  visit(node);
  return found;
};

const isDescendantScope = (scope, ancestorScope) => {
  let current = scope;
  while (current) {
    if (current === ancestorScope) return true;
    current = current.upper;
  }
  return false;
};

const isNonEmptyLiteral = (node) =>
  (node.type === "ArrayExpression" && node.elements.length > 0) ||
  (node.type === "ObjectExpression" && node.properties.length > 0);

/** Name of the function that owns `scope` — a component (PascalCase) or a hook (use[A-Z]...). */
const getComponentOrHookName = (scope) => {
  const block = scope.block;
  if (block.type === "FunctionDeclaration" && block.id) return block.id.name;
  if (block.parent?.type === "VariableDeclarator" && block.parent.id.type === "Identifier") {
    return block.parent.id.name;
  }
  return undefined;
};

const isComponentOrHookName = (name) => !!name && (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name));

const hoistStaticComponentConstantsRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow a static array/object literal declared inside a component body",
    },
    schema: [],
    messages: {
      hoist: "'{{name}}' has no dependency on this component's scope — hoist it to module scope.",
    },
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      VariableDeclarator(node) {
        if (node.id.type !== "Identifier" || !isLiteralCollection(node.init)) return;
        if (!isNonEmptyLiteral(node.init)) return;

        const scope = sourceCode.getScope(node);
        if (scope.type !== "function") return;
        if (!isComponentOrHookName(getComponentOrHookName(scope))) return;

        if (referencesLocalBinding(node.init, scope, sourceCode)) return;

        context.report({ node, messageId: "hoist", data: { name: node.id.name } });
      },
    };
  },
};

export default {
  rules: {
    "hoist-static-component-constants": hoistStaticComponentConstantsRule,
  },
};

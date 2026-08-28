/**
 * Disallow calling a locally-declared `render*` helper function from within
 * the JSX it's declared next to — extract a dedicated subcomponent instead.
 */
const RENDER_NAME_RE = /^render[A-Z]/;

/** True for a locally-declared function/const, false for a parameter (e.g. a render-prop passed in). */
const isLocallyDeclaredFunction = (variable) => {
  if (variable?.scope?.type !== "function") return false;
  const def = variable.defs[0];
  return def?.type === "FunctionName" || def?.type === "Variable";
};

const isInsideJsx = (node) => {
  let current = node.parent;
  while (current) {
    if (current.type === "JSXExpressionContainer") return true;
    current = current.parent;
  }
  return false;
};

const noInlineRenderFunctionRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow calling a locally-declared render* helper function from within JSX",
    },
    schema: [],
    messages: {
      extractSubcomponent:
        "'{{name}}' is a local render helper called from JSX — extract a `<{{suggested}} />` subcomponent instead.",
    },
  },
  create: (context) => {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !RENDER_NAME_RE.test(node.callee.name)) return;
        if (!isInsideJsx(node)) return;

        const scope = context.sourceCode.getScope(node);
        const variable = scope.references.find((ref) => ref.identifier === node.callee)?.resolved;
        if (!isLocallyDeclaredFunction(variable)) return;

        const name = node.callee.name;
        const suggested = name.slice("render".length) || "Section";

        context.report({ node, messageId: "extractSubcomponent", data: { name, suggested } });
      },
    };
  },
};

export default {
  rules: {
    "no-inline-render-function": noInlineRenderFunctionRule,
  },
};

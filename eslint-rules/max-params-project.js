/**
 * max-params for project-owned function signatures only.
 * Skips callbacks whose arity is imposed by a callee or library type
 * (Array.map, react-query onSuccess, JSX render props, etc.).
 */
const WRAPPER_TYPES = new Set([
  "Property",
  "ObjectExpression",
  "ArrayExpression",
  "SpreadElement",
  "ParenthesizedExpression",
  "ChainExpression",
  "ConditionalExpression",
  "LogicalExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "TSTypeAssertion",
]);

const EXPLANATION = `
{{name}} has {{count}} parameters. Maximum allowed is {{max}}.
The idea is to group related parameters together into a single object making callsites more readable because the caller needs to explicitly name each parameter.
The house style is a named Args interface: capitalize the function name, add an Args suffix, and take a single destructured object of that type. Do not leave the shape inline and anonymous.
Example:
  interface BuildSiteEquipmentKeyArgs {
    siteSlug?: string;
    equipmentSlug?: string;
  }

  const buildSiteEquipmentSlugKey = ({ siteSlug, equipmentSlug }: BuildSiteEquipmentKeyArgs) => {
    // ...
  }
`;

const maxParamsProjectRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce a maximum number of parameters on project-owned functions",
    },
    schema: [
      {
        oneOf: [
          { type: "integer", minimum: 0 },
          {
            type: "object",
            properties: { max: { type: "integer", minimum: 0 } },
            additionalProperties: false,
          },
        ],
      },
    ],
    messages: {
      exceed: EXPLANATION,
    },
  },
  create: (context) => {
    const option = context.options[0] ?? 1;
    const max = typeof option === "number" ? option : (option.max ?? 1);

    const checkFunction = (node) => {
      if (node.params.length <= max) return;
      if (isImposedByCallee(node, context)) return;
      if (isImposedByExternalType(node, context)) return;

      context.report({
        node,
        messageId: "exceed",
        data: {
          name: getFunctionName(node),
          count: node.params.length,
          max,
        },
      });
    };

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};

const getFunctionName = (node) => {
  const parent = node.parent;
  if (node.type === "ArrowFunctionExpression") return "Arrow function";
  if (parent?.type === "MethodDefinition" || (parent?.type === "Property" && parent.method)) {
    const key = parent.key;
    if (key?.type === "Identifier") return `Method '${key.name}'`;
    return "Method";
  }
  if (node.type === "FunctionDeclaration" && node.id?.name) return `Function '${node.id.name}'`;
  if (parent?.type === "VariableDeclarator" && parent.id?.type === "Identifier") {
    return `Function '${parent.id.name}'`;
  }
  return "Function";
};

/** Callback passed to a call/new, or nested in an options object / JSX prop. */
const isImposedByCallee = (node, context) => {
  if (isJsxAttributeCallback(node)) return true;
  if (isPassedAsCallArgument(node)) return true;
  return isImposedThroughVariableUsage(node, context);
};

const isPassedAsCallArgument = (node) => {
  let current = node;
  const seen = new Set();

  while (current?.parent && !seen.has(current)) {
    seen.add(current);
    const parent = current.parent;

    if (parent.type === "CallExpression" || parent.type === "NewExpression") {
      return parent.arguments.includes(current);
    }

    if (WRAPPER_TYPES.has(parent.type)) {
      current = parent;
      continue;
    }

    break;
  }

  return false;
};

/**
 * Handles `const stateCreator = (set, get) => (...)` — a callback bound to a
 * name and passed by reference later (e.g. zustand's `create(stateCreator)` /
 * `persist(immer(stateCreator), opts)`) instead of inlined at the call site.
 */
const isImposedThroughVariableUsage = (node, context) => {
  const declarator = node.parent;
  if (declarator?.type !== "VariableDeclarator" || declarator.init !== node) return false;
  if (declarator.id.type !== "Identifier") return false;

  const variable = findVariable(declarator.id, context);
  if (!variable) return false;

  return variable.references.some(
    (reference) => reference.identifier !== declarator.id && isPassedAsCallArgument(reference.identifier)
  );
};

const findVariable = (identifierNode, context) => {
  let scope = context.sourceCode.getScope(identifierNode);
  while (scope) {
    const variable = scope.variables.find((candidate) => candidate.name === identifierNode.name);
    if (variable) return variable;
    scope = scope.upper;
  }
  return null;
};

const isJsxAttributeCallback = (node) => {
  const parent = node.parent;
  if (parent?.type !== "JSXExpressionContainer") return false;
  return parent.parent?.type === "JSXAttribute";
};

const isImposedByExternalType = (node, context) => {
  try {
    const services = context.sourceCode?.parserServices ?? context.parserServices;
    if (!services?.program || !services.esTreeNodeToTSNodeMap) return false;

    const checker = services.program.getTypeChecker();
    const tsNode = services.esTreeNodeToTSNodeMap.get(node);
    if (!tsNode) return false;

    // getContextualType only accepts expressions (arrows / function expressions)
    if (node.type !== "FunctionDeclaration") {
      const contextualType = checker.getContextualType(tsNode);
      if (contextualType && typeDeclaredExternally(contextualType)) return true;
    }

    return classMethodOverridesExternal(node, services, checker);
  } catch {
    return false;
  }
};

const typeDeclaredExternally = (type) => {
  const files = collectDeclarationFiles(type, new Set());
  return files.some(isExternalFile);
};

const collectDeclarationFiles = (type, seen) => {
  if (!type || seen.has(type)) return [];
  seen.add(type);

  if (typeof type.isUnion === "function" && type.isUnion()) {
    return type.types.flatMap((inner) => collectDeclarationFiles(inner, seen));
  }
  if (typeof type.isIntersection === "function" && type.isIntersection()) {
    return type.types.flatMap((inner) => collectDeclarationFiles(inner, seen));
  }

  const files = [];
  for (const signature of type.getCallSignatures?.() ?? []) {
    const declaration = signature.getDeclaration?.();
    if (declaration) files.push(declaration.getSourceFile().fileName);
  }

  const symbol = type.aliasSymbol ?? type.getSymbol?.();
  for (const declaration of symbol?.getDeclarations?.() ?? []) {
    files.push(declaration.getSourceFile().fileName);
  }

  return files;
};

const classMethodOverridesExternal = (functionNode, services, checker) => {
  const methodDef = functionNode.parent;
  if (methodDef?.type !== "MethodDefinition") return false;

  const classLike = methodDef.parent?.parent;
  if (classLike?.type !== "ClassDeclaration" && classLike?.type !== "ClassExpression") return false;

  const methodName = methodDef.key?.type === "Identifier" ? methodDef.key.name : null;
  if (!methodName) return false;

  const tsClass = services.esTreeNodeToTSNodeMap.get(classLike);
  if (!tsClass) return false;

  const classType = checker.getTypeAtLocation(tsClass);
  const bases = classType.getBaseTypes?.() ?? [];

  for (const base of bases) {
    const property = checker.getPropertyOfType(base, methodName);
    const declarations = property?.getDeclarations?.() ?? [];
    if (declarations.some((declaration) => isExternalFile(declaration.getSourceFile().fileName))) {
      return true;
    }
  }

  return false;
};

const isExternalFile = (fileName) => {
  const normalized = fileName.replaceAll("\\", "/");
  return normalized.includes("/node_modules/") || normalized.includes("/typescript/lib/");
};

export default {
  rules: {
    "max-params": maxParamsProjectRule,
  },
};

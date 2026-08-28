/**
 * Enforce the project's file-naming convention against a file's actual
 * exported shape: hooks (`use-*.ts`), and Page/Dialog/Provider-suffixed
 * components (`*-page.tsx`, `*-dialog.tsx`, `*-provider.tsx`). Also blocks
 * generic, un-prefixed root-level basenames (`utils.ts`, `types.ts`, ...).
 *
 * Deliberately narrow scope: only fires when a file has exactly ONE
 * function-like export to check against — multi-export files (stores,
 * shared utils/types modules) are left alone rather than guessed at.
 */
const GENERIC_BASENAMES = new Set(["utils", "types", "helpers", "constants", "config", "client", "index"]);

const KEBAB_SUFFIX_BY_NAME_SUFFIX = [
  { nameSuffix: "Page", kebabSuffix: "-page" },
  { nameSuffix: "Dialog", kebabSuffix: "-dialog" },
  { nameSuffix: "Provider", kebabSuffix: "-provider" },
];

const getBasename = (filename) => {
  const withoutDir = filename.replaceAll("\\", "/").split("/").pop() ?? filename;
  return withoutDir.replace(/\.(tsx|ts|jsx|js)$/, "");
};

/**
 * Every top-level named *value* export (function, class, or const/let/var),
 * flagging which ones are function-like. Type-only exports (interface/type
 * alias) don't count — they're auxiliary to whatever the file's primary
 * value export is, not competitors for the file's identity.
 */
const collectPrimaryValueExports = (programBody) => {
  const exportsFound = [];

  for (const statement of programBody) {
    if (statement.type !== "ExportNamedDeclaration" || !statement.declaration) continue;
    const declaration = statement.declaration;

    if (declaration.type === "FunctionDeclaration" && declaration.id) {
      exportsFound.push({ name: declaration.id.name, isFunctionLike: true });
      continue;
    }

    if (declaration.type === "ClassDeclaration" && declaration.id) {
      exportsFound.push({ name: declaration.id.name, isFunctionLike: false });
      continue;
    }

    if (declaration.type === "VariableDeclaration") {
      for (const declarator of declaration.declarations) {
        if (declarator.id.type !== "Identifier") continue;
        const isFunctionLike =
          declarator.init?.type === "ArrowFunctionExpression" || declarator.init?.type === "FunctionExpression";
        exportsFound.push({ name: declarator.id.name, isFunctionLike });
      }
    }
  }

  return exportsFound;
};

const filenameConventionByExportShapeRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce filename conventions against a file's exported shape",
    },
    schema: [],
    messages: {
      genericBasename:
        "'{{basename}}' is a generic root-level filename — prefix it with its domain (e.g. '{{example}}').",
      hookFilename: "This file's sole export '{{name}}' is a hook — rename the file to start with 'use-'.",
      suffixFilename:
        "This file's sole export '{{name}}' ends in '{{nameSuffix}}' — rename the file to end with '{{kebabSuffix}}'.",
    },
  },
  create: (context) => {
    return {
      "Program:exit"(program) {
        const basename = getBasename(context.filename);

        if (GENERIC_BASENAMES.has(basename.toLowerCase())) {
          context.report({
            node: program,
            messageId: "genericBasename",
            data: { basename, example: `<domain>.${basename}.ts` },
          });
        }

        const primaryExports = collectPrimaryValueExports(program.body);
        if (primaryExports.length !== 1) return;

        const [primary] = primaryExports;
        if (!primary.isFunctionLike) return;

        const { name } = primary;

        if (/^use[A-Z]/.test(name)) {
          if (!basename.startsWith("use-")) {
            context.report({ node: program, messageId: "hookFilename", data: { name } });
          }
          return;
        }

        for (const { nameSuffix, kebabSuffix } of KEBAB_SUFFIX_BY_NAME_SUFFIX) {
          if (!name.endsWith(nameSuffix)) continue;
          if (!basename.endsWith(kebabSuffix)) {
            context.report({ node: program, messageId: "suffixFilename", data: { name, nameSuffix, kebabSuffix } });
          }
          return;
        }
      },
    };
  },
};

export default {
  rules: {
    "filename-convention-by-export-shape": filenameConventionByExportShapeRule,
  },
};

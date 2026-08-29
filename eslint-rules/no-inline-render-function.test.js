import { RuleTester } from "eslint";
import { describe, it } from "vitest";
import noInlineRenderFunction from "./no-inline-render-function.js";

RuleTester.describe = describe;
RuleTester.it = it;

const rule = noInlineRenderFunction.rules["no-inline-render-function"];
const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module", parserOptions: { ecmaFeatures: { jsx: true } } },
});

ruleTester.run("no-inline-render-function", rule, {
  valid: [
    "import { renderIcon } from './icons'; const Comp = () => <div>{renderIcon()}</div>;",
    "const Comp = () => { const renderIcon = () => <Icon />; return renderIcon(); };",
    "const Comp = ({ renderRow }) => <div>{renderRow(item, index)}</div>;", // render-prop passed in, not locally declared
  ],
  invalid: [
    {
      code: "const Comp = () => { const renderTextInputIcon = () => <Icon />; return <div>{renderTextInputIcon()}</div>; };",
      errors: [{ messageId: "extractSubcomponent", data: { name: "renderTextInputIcon", suggested: "TextInputIcon" } }],
    },
  ],
});

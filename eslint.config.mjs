import { fixupPluginRules } from "@eslint/compat";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import jsxRuntime from "eslint-plugin-react/experimental/generated.js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginNext from "eslint-config-next";

export default [
  {
    ignores: ["**/node_modules/", "**/.next/", "**/out/", "**/dist/"],
  },
  ...pluginNext.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: fixupPluginRules(reactRecommended),
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactRecommended.rules,
      ...jsxRuntime.rules,
    },
  },
];

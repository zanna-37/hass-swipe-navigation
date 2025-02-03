import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      ecmaVersion: 2024,
      sourceType: "script",

      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      indent: ["error", 2, {
        SwitchCase: 1,
      }],

      "linebreak-style": ["error", "unix"],
      quotes: ["warn", "double"],
      semi: ["error", "always"],
      "@typescript-eslint/no-explicit-any": ["error"],
      "@typescript-eslint/no-misused-promises": ["error"],
      "@typescript-eslint/no-floating-promises": ["error"],
    }
  }
);

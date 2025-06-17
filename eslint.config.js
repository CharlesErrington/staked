import globals from "globals";
import presetPrettier from "eslint-config-prettier";
import pluginReactNative from "eslint-plugin-react-native";
import pluginTypescript from "@typescript-eslint/eslint-plugin";
import parserTypescript from "@typescript-eslint/parser";

export default [
  {
    ignores: [".expo/", "node_modules/"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: parserTypescript,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        "react-native": true,
      },
    },
    plugins: {
      "react-native": pluginReactNative,
      "@typescript-eslint": pluginTypescript,
    },
    rules: {
      ...pluginReactNative.configs.all.rules,
      "react-native/no-unused-styles": "error",
      "react-native/no-inline-styles": "off",
      "react-native/no-raw-text": "off",
      "react-native/no-color-literals": "off",
      "react-native/sort-styles": "off",
      "react-native/split-platform-components": "off",
    },
  },
  presetPrettier,
];

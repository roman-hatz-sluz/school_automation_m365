const js = require("@eslint/js");
const prettier = require("eslint-plugin-prettier"); // Optional: Prettier for code formatting

module.exports = [
  js.configs.recommended, // Load ESLint's recommended configuration
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"], // Specify file types
    ignores: ["node_modules"], // Folders to ignore
    languageOptions: {
      ecmaVersion: "latest", // Support for modern JavaScript
      sourceType: "module", // Enable ESModules
    },
    plugins: {
      prettier, // Optional: Include Prettier as a plugin
    },
    rules: {
      "no-unused-vars": "warn", // Example: Customize specific rules
      "no-console": "off",
      "prettier/prettier": "error", // Optional: Enable Prettier rules
    },
  },
];

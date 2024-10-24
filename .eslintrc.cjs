/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true, // Added for Remix server-side code
  },
  // Changed ignorePatterns to exclude build artifacts and node_modules
  ignorePatterns: ["node_modules", "build", "public/build", ".cache"],

  // Base config
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended", // Move this up for better base rules
  ],

  overrides: [
    // React
    {
      files: ["**/*.{js,jsx,ts,tsx}"],
      plugins: ["react", "jsx-a11y"],
      extends: [
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:remix/recommended", // Added Remix specific rules
      ],
      settings: {
        react: {
          version: "detect",
        },
        formComponents: ["Form"],
        linkComponents: [
          { name: "Link", linkAttribute: "to" },
          { name: "NavLink", linkAttribute: "to" },
        ],
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: "./tsconfig.json", // Added explicit project reference
          },
        },
      },
      rules: {
        // Added some common rules for Remix projects
        "react/prop-types": "off", // Since we're using TypeScript
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "import/no-unresolved": "error",
        "import/order": [
          "error",
          {
            groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
            "newlines-between": "always",
            alphabetize: { order: "asc", caseInsensitive: true },
          },
        ],
      },
    },

    // Typescript
    {
      files: ["**/*.{ts,tsx}"],
      plugins: ["@typescript-eslint", "import"],
      parser: "@typescript-eslint/parser",
      settings: {
        "import/internal-regex": "^~/",
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: "./tsconfig.json", // Added explicit project reference
          },
          node: {
            extensions: [".ts", ".tsx"],
          },
        },
      },
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
      ],
      rules: {
        // Added TypeScript-specific rules
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      },
    },

    // Node
    {
      files: [".eslintrc.cjs", "remix.config.js", "tailwind.config.ts"],
      env: {
        node: true,
      },
    },
  ],
};
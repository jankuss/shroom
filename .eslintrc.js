module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    "semi": 2,
    "comma-dangle": 0,
    "no-undef": 0,
    "prefer-const": 2,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/member-ordering": [2],
    "@typescript-eslint/naming-convention": [
      2,
      {
        "selector": "classProperty",
        "format": ["UPPER_CASE"],
        "modifiers": ['private', 'static', 'readonly']
      },
      {
        "selector": ["classMethod", "classProperty"],
        "format": ["camelCase"],
        "modifiers": ["private"],
        "leadingUnderscore": "require"
      }
    ],
  },
};

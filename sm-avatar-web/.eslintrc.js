module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'react/jsx-filename-extension': 0,
    'no-console': 0,
    'default-param-last': 0,
    'linebreak-style': 0,
    'no-multiple-empty-lines': 0,
    'padded-blocks': 0,
    'no-trailing-spaces': 0,
    'no-trailing-spaces': 0,
    'no-multiple-empty-lines' : 0,
    'no-underscore-dangle': 0
  },
};

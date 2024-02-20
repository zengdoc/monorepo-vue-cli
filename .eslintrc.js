module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 8
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn'
  }
}

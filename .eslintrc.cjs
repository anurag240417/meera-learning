module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  extends: ['airbnb', 'airbnb/hooks'],
  settings: {
    'import/resolver': { node: { extensions: ['.js', '.jsx'] } },
  },
  rules: {
    // React 18.3 deprecates defaultProps on function components; use default parameters.
    'react/require-default-props': ['error', { functions: 'defaultArguments' }],
  },
  // api/ is the client-supplied local registration API, kept exactly as delivered.
  ignorePatterns: ['dist/', 'node_modules/', 'api/'],
  overrides: [
    {
      files: ['vite.config.js', '.eslintrc.cjs'],
      env: { node: true, browser: false },
      rules: {
        'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      },
    },
  ],
};

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint','tailwindcss'],
  extends: ['next/core-web-vitals','plugin:@typescript-eslint/recommended','plugin:tailwindcss/recommended'],
  rules: {
    'no-restricted-syntax': [
      'error',
      { selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]", message: 'Use a design token or Tailwind theme color instead of raw hex.' }
    ],
    'tailwindcss/no-custom-classname': 'off',
    'react/no-unescaped-entities': ['error', { forbid: ['>', '}'] }]
  }
};

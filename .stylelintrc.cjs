module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-no-hex': true,
    'at-rule-no-unknown': [true, { ignoreAtRules: ['tailwind'] }]
  }
};

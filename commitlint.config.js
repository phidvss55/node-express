module.exports = {
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'style', 'perf', 'ci', 'build']],
    'type-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'scope-empty': [2, 'always'],
    'header-pattern': [2, 'always', /^\([a-z]+\): .+$/],
  },
};

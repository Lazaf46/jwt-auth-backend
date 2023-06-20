module.exports = {
    reporters: [
      'default',
      ['jest-junit', { outputDirectory: 'test-results/junit' }]
    ]
};

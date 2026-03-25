module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/setupTests.js'],
  moduleNameMapper: {
    '\\.(scss|css)$': '<rootDir>/src/__mocks__/styleMock.js',
  },
};

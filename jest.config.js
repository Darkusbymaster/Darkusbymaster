module.exports = {
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "src/**/*.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "clover"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

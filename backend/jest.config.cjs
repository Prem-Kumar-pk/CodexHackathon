module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/db/seed.js"
  ],
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"]
};

module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx"
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/test/styleMock.js"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.cjs"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{js,jsx}"],
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          ["@babel/preset-react", { runtime: "automatic" }]
        ]
      }
    ]
  }
};

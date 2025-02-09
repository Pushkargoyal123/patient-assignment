module.exports = {
  preset: "ts-jest",
  testEnvironment: 'node',
  roots: ['<rootDir>/dist/test'],
  testMatch: ['**/*.test.js'],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { useESM: true },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true
    }
  },
};

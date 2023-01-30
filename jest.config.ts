import { Config } from "jest";

const config: Config = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@functions/(.*)$': '<rootDir>/src/functions/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
  },
  setupFiles: ['./tests/jestSetup.ts'],
  setupFilesAfterEnv: ['./tests/setupFrameworks.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/dist/',
  ],
  collectCoverage: true,
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/utils.ts'],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  transformIgnorePatterns: ["/node_modules/(?!filter-obj)"],
  verbose: true,
};

export default config;

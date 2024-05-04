/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  collectCoverageFrom: [
    "<rootDir>/app/**/*.ts",
  ],
  coverageDirectory: "<rootDir>/out/coverage/",
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    "<rootDir>/test/",
    "<rootDir>/app/",
    "<rootDir>/db/",
  ],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/$1",
  }
};
// /** @type {import('ts-jest').JestConfigWithTsJest} */
// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
// };

module.exports = {
  roots: ['<rootDir>/src'],
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testRegex: '(/__test__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  collectCoverage: true,
  // collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  collectCoverageFrom: ['<rootDir>/src/service/**/*.ts'],
}

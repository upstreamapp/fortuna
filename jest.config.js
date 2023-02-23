module.exports = {
  preset: 'ts-jest',
  bail: true,
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 20000,
  moduleNameMapper: {
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@models(.*)$': '<rootDir>/src/models$1'
  },
  testRegex: '.test.(ts|js)$',
  rootDir: '.',
  globalSetup: './jest.setup.js',
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: ['dotenv/config'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  transformIgnorePatterns: ['/node_modules/(?!(@upstreamapp)/)'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        addFileAttribute: 'true'
      }
    ]
  ]
}

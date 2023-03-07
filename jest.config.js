module.exports = {
  preset: 'ts-jest',
  bail: true,
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 20000,
  moduleNameMapper: {
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@models(.*)$': '<rootDir>/src/models$1',
    '^@lib(.*)$': '<rootDir>/src/lib$1',
    '^@types(.*)$': '<rootDir>/src/@types$1'
  },
  testRegex: '.test.(ts|js)$',
  rootDir: '.',
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

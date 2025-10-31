module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
    rootDir: '.',
    testMatch: ['**/*.unit.test.ts', '**/*.unit.test.tsx'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react-jsx',
                },
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!(@gravity-ui)/)'],
    moduleNameMapper: {
        '\\.(css|scss|sass)$': '<rootDir>/test-utils/__mocks__/styleMock.js',
    },
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/__stories__/**/*', '!**/*/*.stories.{ts,tsx}'],
};

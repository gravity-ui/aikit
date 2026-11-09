module.exports = {
    verbose: true,
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
    rootDir: '.',
    testMatch: ['**/*.unit.test.ts', '**/*.unit.test.tsx'],
    transform: {
        '^.+\\.jsx?$': [
            'babel-jest',
            {
                babelrc: false,
                configFile: false,
                presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
            },
        ],
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react-jsx',
                    module: 'commonjs',
                    moduleResolution: 'node',
                },
                isolatedModules: true,
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!(@gravity-ui|colors-named|colors-named-hex)/)'],
    moduleNameMapper: {
        '^marked$': '<rootDir>/node_modules/marked/lib/marked.umd.js',
        '\\.(css|scss|sass)$': '<rootDir>/test-utils/__mocks__/styleMock.js',
    },
    coverageDirectory: './coverage',
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/__stories__/**/*', '!**/*/*.stories.{ts,tsx}'],
};

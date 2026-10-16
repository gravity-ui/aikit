module.exports = {
    rootDir: '../../..',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/demo/Themer/**/*.test.ts'],
    transform: {
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                isolatedModules: true,
                tsconfig: {
                    allowJs: true,
                    module: 'commonjs',
                    moduleResolution: 'node',
                    target: 'es2020',
                },
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!(@gravity-ui/uikit-themer|lodash-es)/)'],
    moduleNameMapper: {'^(\\.{1,2}/.*)\\.js$': '$1'},
};

import type {StorybookConfig} from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
    addons: [
        '@storybook/preset-scss',
        '@storybook/addon-webpack5-compiler-babel',
        '@storybook/addon-docs',
    ],

    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },

    docs: {
        defaultName: 'Docs',
    },

    core: {
        disableTelemetry: true,
    },

    features: {
        backgrounds: false,
    },
};

module.exports = config;

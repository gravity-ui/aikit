import type {StorybookConfig} from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/preset-scss',
        {name: '@storybook/addon-essentials', options: {backgrounds: false}},
        '@storybook/addon-webpack5-compiler-babel'
    ],

    framework: {
        name: '@storybook/react-webpack5',
        options: {}
    },

    docs: {
        autodocs: true
    },
    core: {
        disableTelemetry: true,
    },
};

module.exports = config;

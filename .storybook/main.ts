import type {StorybookConfig} from '@storybook/react-webpack5';
import {sassFunctions} from '../build-utils/sass-functions';

const config: StorybookConfig = {
    framework: '@storybook/react-webpack5',
    stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
    docs: {
        defaultName: 'Docs',
    },
    addons: [
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.(css|scss)$/i,
                        use: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    sassOptions: {
                                        functions: sassFunctions,
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        },
        './theme-addon/register.tsx',
        '@storybook/preset-scss',
        '@storybook/addon-webpack5-compiler-babel',
        '@storybook/addon-docs',
        'storybook-addon-mock-date',
    ],
    core: {
        disableTelemetry: true,
    },

    features: {
        backgrounds: false,
    },

    webpackFinal: async (config) => {
        config.resolve = config.resolve || {};
        config.resolve.fallback = {
            ...config.resolve.fallback,
            process: require.resolve('process/browser'),
            url: false,
            fs: false,
            path: false,
        };
        return config;
    },
};

module.exports = config;

import type {Preview} from '@storybook/react-webpack5';
import React from 'react';
import {DocsDecorator} from '../src/demo/DocsDecorator/DocsDecorator';
import {ThemeContext} from '../src/demo/DocsDecorator/ThemeContext';

import {withLang} from './decorators/withLang';
import {WithTheme} from './decorators/withTheme';
import {themes} from './theme';

import '@gravity-ui/uikit/styles/styles.css';
import '../src/styles/styles.scss';

const MOCK_DATE = new Date('2025-11-12T10:19:59.971Z');

// Theme decorator
const ThemeDecorator = (Story: any, context: any) => {
    const theme = context.globals.theme || 'light';

    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.add('g-root');
        document.body.classList.add(`g-root_theme_${theme}`);

        // Update docs theme
        const docsRoot = document.querySelector('.docs-story');
        if (docsRoot) {
            docsRoot.setAttribute('data-theme', theme);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={theme}>
            <Story />
        </ThemeContext.Provider>
    );
};

const preview: Preview = {
    decorators: [ThemeDecorator, WithTheme, withLang],

    parameters: {
        mockingDate: MOCK_DATE,
        docs: {
            theme: themes.light,
            container: DocsDecorator,
            codePanel: true,
        },
        backgrounds: {disabled: true},
        options: {
            storySort: {
                order: ['Components', ['Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages']],
                method: 'alphabetical',
            },
        },
    },

    globalTypes: {
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                ],
                dynamicTitle: true,
            },
        },
        lang: {
            defaultValue: 'en',
            toolbar: {
                title: 'Language',
                icon: 'globe',
                items: [
                    {value: 'en', right: '🇺🇸', title: 'English'},
                    {value: 'ru', right: '🇷🇺', title: 'Russian'},
                ],
                dynamicTitle: true,
            },
        },
    },

    tags: ['autodocs'],
};

export default preview;

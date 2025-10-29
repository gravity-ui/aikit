import type {Preview} from '@storybook/react';
import React from 'react';

import '@gravity-ui/uikit/styles/styles.css';
import '../src/themes/light.css';
import '../src/themes/dark.css';
import '../src/themes/variables.css';

import '../src/styles/styles.scss';

// Theme decorator
const ThemeDecorator = (Story: any, context: any) => {
    const theme = context.globals.theme || 'light';
    
    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.add('g-root');
        document.body.classList.add('g-root_theme_light');
    }, [theme]);

    return <Story />;
};

const preview: Preview = {
    decorators: [ThemeDecorator],
    parameters: {
        docs: {
            autodocs: true,
        },
        backgrounds: {disable: true},
        options: {
            storySort: {
                order: [
                    'Components',
                    ['Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'],
                ],
                method: 'alphabetical',
            },
        },
    },
    globalTypes: {
        // theme: {
        //     toolbar: {
        //         title: 'Theme',
        //         icon: 'mirror',
        //         items: [
        //             {value: 'light', right: '☼', title: 'Light'},
        //             {value: 'dark', right: '☾', title: 'Dark'},
        //         ],
        //         dynamicTitle: true,
        //     },
        // },
    },
};

export default preview;

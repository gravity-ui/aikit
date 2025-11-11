import React from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import {StoryContext, StoryFn} from '@storybook/react-webpack5';

export const WithTheme = (Story: StoryFn, context: StoryContext) => {
    return (
        <ThemeProvider theme={context.globals.theme} direction={context.globals.direction}>
            <Story {...context} />
        </ThemeProvider>
    );
};

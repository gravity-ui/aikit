import React from 'react';

import {Provider} from '@gravity-ui/uikit';
import {StoryContext, StoryFn} from '@storybook/react-webpack5';

export const WithTheme = (Story: StoryFn, context: StoryContext) => {
    return (
        <Provider
            theme={context.globals.theme}
            direction={context.globals.direction}
            lang={context.globals.lang}
        >
            <Story {...context} />
        </Provider>
    );
};

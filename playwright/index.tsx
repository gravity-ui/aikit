import React from 'react';

import {ThemeProvider} from '@gravity-ui/uikit';
import {beforeMount} from '@playwright/experimental-ct-react/hooks';

import './index.scss';

beforeMount(async ({App}) => {
    return (
        <ThemeProvider>
            <App />
        </ThemeProvider>
    );
});

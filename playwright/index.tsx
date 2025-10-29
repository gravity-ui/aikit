import React from 'react';

import {beforeMount} from '@playwright/experimental-ct-react/hooks';
import {ThemeProvider} from '@gravity-ui/uikit';

import './index.scss';

beforeMount(async ({App}) => {
    return (
        <ThemeProvider>
            <App />
        </ThemeProvider>
    );
});

import React from 'react';

import {Provider} from '@gravity-ui/uikit';
import {beforeMount} from '@playwright/experimental-ct-react/hooks';

import './index.scss';

beforeMount(async ({App}) => {
    return (
        <Provider>
            <App />
        </Provider>
    );
});

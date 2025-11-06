import * as React from 'react';
import type {Decorator} from '@storybook/react';
import {configure} from '@gravity-ui/uikit';

export const withLang: Decorator = (Story, context) => {
    const lang = context.globals.lang;

    configure({
        lang: lang,
    });

    return <Story key={lang} {...context} />;
};

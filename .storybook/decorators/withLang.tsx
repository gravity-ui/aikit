import * as React from 'react';
import type {Decorator} from '@storybook/react-webpack5';

export const withLang: Decorator = (Story, context) => {
    const lang = context.globals.lang;

    return <Story key={lang} {...context} />;
};

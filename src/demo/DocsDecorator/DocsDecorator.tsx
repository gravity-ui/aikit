import React from 'react';

import {MobileProvider, ThemeProvider, getThemeType} from '@gravity-ui/uikit';
import {DocsContainer} from '@storybook/addon-docs';
import type {DocsContainerProps} from '@storybook/addon-docs';

import {themes} from '../../../.storybook/theme';
import {cn} from '../../utils/cn';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = cn('docs-decorator');

export function DocsDecorator({children, context}: DocsDecoratorProps) {
    // @ts-expect-error
    const theme = context.store.userGlobals.globals.theme;
    return (
        <div className={b()}>
            <DocsContainer context={context} theme={themes[getThemeType(theme)]}>
                <ThemeProvider theme={theme}>
                    <MobileProvider mobile={false}>{children}</MobileProvider>
                </ThemeProvider>
            </DocsContainer>
        </div>
    );
}

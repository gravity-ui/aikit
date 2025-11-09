import React from 'react';

import {MobileProvider, ThemeProvider, getThemeType} from '@gravity-ui/uikit';
import {DocsContainer} from '@storybook/addon-docs';
import type {DocsContainerProps} from '@storybook/addon-docs';

import {themes} from '../../../.storybook/theme';
import {cn} from '../../utils/cn';

import {ThemeContext} from './ThemeContext';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = cn('docs-decorator');

export function DocsDecorator({children, context}: DocsDecoratorProps) {
    const theme = React.useContext(ThemeContext);
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

import React from 'react';

import {Provider, getThemeType} from '@gravity-ui/uikit';
import {DocsContainer} from '@storybook/addon-docs';
import type {DocsContainerProps} from '@storybook/addon-docs';

import {themes} from '../../../.storybook/theme';
import {cn} from '../../utils/cn';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = cn('docs-decorator');

export function DocsDecorator({children, context}: DocsDecoratorProps) {
    // @ts-expect-error
    const {theme, lang} = context.store.userGlobals.globals;
    return (
        <div className={b()}>
            <DocsContainer context={context} theme={themes[getThemeType(theme)]}>
                <Provider theme={theme} lang={lang} mobile={false}>
                    {children}
                </Provider>
            </DocsContainer>
        </div>
    );
}

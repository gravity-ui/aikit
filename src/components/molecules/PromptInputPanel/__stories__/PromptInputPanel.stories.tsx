import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {PromptInputPanel} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {SwapArea} from '../../../../demo/SwapArea';
import {ActionButton} from '../../../atoms/ActionButton';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/PromptInputPanel',
    component: PromptInputPanel,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof PromptInputPanel>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        children: 'This is the panel content',
    },
    decorators: defaultDecorators,
};

export const WithSwapArea: Story = {
    args: {
        children: <SwapArea />,
    },
    decorators: defaultDecorators,
};

export const WithContentAndCloseButton: Story = {
    args: {
        children: (
            <>
                <div style={{flex: 1}}>
                    <span>Upgrade your plan to Business to unlock all features</span>
                </div>
                <Button view="action" size="m">
                    Upgrade
                </Button>
                <ActionButton view="flat" size="m" onClick={() => {}}>
                    <Icon data={Xmark} size={16} />
                </ActionButton>
            </>
        ),
    },
    decorators: defaultDecorators,
};

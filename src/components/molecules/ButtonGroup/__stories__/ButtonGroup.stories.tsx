import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ButtonGroup, type ButtonGroupProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/ButtonGroup',
    component: ButtonGroup,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        orientation: {
            control: 'radio',
            options: ['horizontal', 'vertical'],
            description: 'Orientation of buttons',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

type Story = StoryObj<typeof ButtonGroup>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const buttonChildren = (
    <>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
    </>
);

export const Playground: StoryFn<ButtonGroupProps> = (args) => (
    <ContentWrapper>
        <ButtonGroup {...args} />
    </ContentWrapper>
);
Playground.args = {
    children: buttonChildren,
    orientation: 'horizontal',
};

export const Orientation: StoryObj<ButtonGroupProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="Horizontal">
                <ButtonGroup {...args} orientation="horizontal">
                    {buttonChildren}
                </ButtonGroup>
            </ShowcaseItem>
            <ShowcaseItem title="Vertical">
                <ButtonGroup {...args} orientation="vertical">
                    {buttonChildren}
                </ButtonGroup>
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

import {Button} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {ButtonGroup, type ButtonGroupProps} from '..';
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
        size: {
            control: 'radio',
            options: ['xs', 's', 'm'],
            description: 'Spacing',
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
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const buttonChildren = (
    <>
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
    </>
);

export const Playground: StoryFn<ButtonGroupProps> = (args) => <ButtonGroup {...args} />;
Playground.args = {
    children: buttonChildren,
    orientation: 'horizontal',
    size: 's',
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

export const Size: StoryObj<ButtonGroupProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="Size xs">
                <ButtonGroup {...args} size="xs">
                    {buttonChildren}
                </ButtonGroup>
            </ShowcaseItem>
            <ShowcaseItem title="Size s">
                <ButtonGroup {...args} size="s">
                    {buttonChildren}
                </ButtonGroup>
            </ShowcaseItem>
            <ShowcaseItem title="Size m">
                <ButtonGroup {...args} size="m">
                    {buttonChildren}
                </ButtonGroup>
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

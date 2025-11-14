import {At, Envelope, Gear} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {Tabs, type TabsProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/Tabs',
    component: Tabs,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        items: {
            control: 'object',
            description: 'Array of tab items',
        },
        activeId: {
            control: 'text',
            description: 'ID of the currently active tab',
        },
        allowDelete: {
            control: 'boolean',
            description: 'Whether to show delete buttons',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        styles: {
            control: 'object',
            description: 'Additional CSS properties',
        },
    },
} as Meta;

type Story = StoryObj<typeof Tabs>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

const basicItems = [
    {id: '1', title: 'Chat name 1'},
    {id: '2', title: 'Chat name 2'},
    {id: '3', title: 'Chat name 3'},
    {id: '4', title: 'Chat name 4'},
];

const itemsWithIcons = [
    {id: '1', title: 'Chat name 1', icon: <Icon data={At} size={16} />},
    {id: '2', title: 'Chat name 2', icon: <Icon data={Envelope} size={16} />},
    {id: '3', title: 'Chat name 3', icon: <Icon data={Gear} size={16} />},
];
export const Playground: StoryFn<TabsProps> = (args) => (
    <ContentWrapper>
        <Tabs {...args} />
    </ContentWrapper>
);
Playground.args = {
    items: basicItems,
    activeId: '1',
    allowDelete: true,
};

export const Basic: StoryObj<TabsProps> = {
    render: (args) => (
        <ShowcaseItem title="Basic Tabs">
            <Tabs {...args} />
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

Basic.args = {
    items: basicItems,
    activeId: '1',
    allowDelete: true,
};

export const WithIcons: StoryObj<TabsProps> = {
    render: (args) => (
        <ShowcaseItem title="Tabs with Icons">
            <Tabs {...args} />
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

WithIcons.args = {
    items: itemsWithIcons,
    activeId: '1',
    allowDelete: true,
};

export const WithStyle: StoryObj<TabsProps> = {
    render: (args) => (
        <ShowcaseItem title="Tabs with Style">
            <Tabs {...args} />
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

WithStyle.args = {
    items: basicItems,
    activeId: '1',
    allowDelete: true,
    style: {
        '--g-color-base-info-light': '#ff9100',
        '--g-color-base-info-light-hover': '#aa9100',
        '--g-color-text-info-heavy': '#ffffff',
        '--g-color-base-simple-hover': '#aa9100',
        '--g-color-text-complementary': '#ff9100',
        '--g-color-line-generic': '#ff9100',
    },
};

export const MaxWidth: StoryObj<TabsProps> = {
    render: (args) => (
        <ShowcaseItem title="Max width (200px)">
            <div style={{maxWidth: '200px', border: '1px solid lightgray'}}>
                <h1 style={{paddingInline: '10px'}}>Lorem ipsum</h1>
                <Tabs {...args} />
                <p style={{paddingInline: '10px'}}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio consectetur
                    commodi natus dolor repellendus sit, similique aliquam, quia ad hic quam porro
                    nobis a? Cumque ratione est nostrum exercitationem velit.
                </p>
            </div>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

MaxWidth.args = {
    items: basicItems,
    activeId: '1',
    allowDelete: true,
};

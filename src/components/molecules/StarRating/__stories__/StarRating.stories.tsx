import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {StarRating} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/StarRating',
    component: StarRating,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        value: {
            control: {type: 'number', min: 0, max: 5},
            description: 'Current rating value (1-5)',
        },
        onChange: {
            control: false,
            description: 'Callback when rating changes',
        },
        disabled: {
            control: 'boolean',
            description: 'Disabled state',
        },
        size: {
            control: 'radio',
            options: ['s', 'm', 'l'],
            description: 'Size of star icons',
        },
        'aria-label': {
            control: 'text',
            description: 'Custom aria-label for accessibility',
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

type Story = StoryObj<typeof StarRating>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Showcase>
                <Story />
            </Showcase>
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    render: (args) => {
        const [value, setValue] = useState(args.value);

        return (
            <ContentWrapper>
                <StarRating {...args} value={value} onChange={setValue} />
            </ContentWrapper>
        );
    },
    args: {
        value: 3,
        size: 'l',
        disabled: false,
    },
};

export const Sizes: Story = {
    render: () => (
        <>
            <ShowcaseItem title="Small (s)">
                <StarRating value={3} size="s" />
            </ShowcaseItem>
            <ShowcaseItem title="Medium (m)">
                <StarRating value={3} size="m" />
            </ShowcaseItem>
            <ShowcaseItem title="Large (l) - Default">
                <StarRating value={3} size="l" />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

export const Values: Story = {
    render: () => (
        <>
            <ShowcaseItem title="Empty (no rating)">
                <StarRating />
            </ShowcaseItem>
            <ShowcaseItem title="1 Star">
                <StarRating value={1} />
            </ShowcaseItem>
            <ShowcaseItem title="2 Stars">
                <StarRating value={2} />
            </ShowcaseItem>
            <ShowcaseItem title="3 Stars">
                <StarRating value={3} />
            </ShowcaseItem>
            <ShowcaseItem title="4 Stars">
                <StarRating value={4} />
            </ShowcaseItem>
            <ShowcaseItem title="5 Stars">
                <StarRating value={5} />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

export const Disabled: Story = {
    render: () => (
        <>
            <ShowcaseItem title="Disabled with value">
                <StarRating value={3} disabled />
            </ShowcaseItem>
            <ShowcaseItem title="Disabled without value">
                <StarRating disabled />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

export const Interactive: Story = {
    render: () => {
        const [value, setValue] = useState<number | undefined>(undefined);

        return (
            <ShowcaseItem
                title={`Interactive Rating${value ? ` - Current: ${value} stars` : ' - Click to rate'}`}
            >
                <StarRating value={value} onChange={setValue} />
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithState: Story = {
    render: () => {
        const [rating1, setRating1] = useState(2);
        const [rating2, setRating2] = useState(4);

        return (
            <>
                <ShowcaseItem title={`Low Rating: ${rating1} stars`}>
                    <StarRating value={rating1} onChange={setRating1} />
                </ShowcaseItem>
                <ShowcaseItem title={`High Rating: ${rating2} stars`}>
                    <StarRating value={rating2} onChange={setRating2} />
                </ShowcaseItem>
            </>
        );
    },
    decorators: defaultDecorators,
};

export const CustomAriaLabel: Story = {
    render: () => (
        <ShowcaseItem title="Custom Aria Label">
            <StarRating value={4} aria-label="Rate your experience with our service" />
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

import {useState} from 'react';

import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {RatingBlock, RatingBlockProps} from '../RatingBlock';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/RatingBlock',
    component: RatingBlock,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        title: {
            control: 'text',
            description: 'Title text or React element',
        },
        value: {
            control: {type: 'number', min: 0, max: 5, step: 1},
            description: 'Current rating value (1-5)',
        },
        size: {
            control: 'select',
            options: ['s', 'm', 'l'],
            description: 'Star size',
        },
    },
} as Meta;

type Story = StoryObj<typeof RatingBlock>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<RatingBlockProps> = (args) => {
    const [value, setValue] = useState<number | undefined>(args.value);

    return (
        <ContentWrapper width="450px">
            <RatingBlock {...args} value={value} onChange={setValue} />
        </ContentWrapper>
    );
};

Playground.args = {
    title: 'Rate the assistant response:',
    value: undefined,
    size: 'l',
};

export const Default: Story = {
    render: () => {
        const [value, setValue] = useState<number | undefined>(undefined);

        return (
            <ContentWrapper width="450px">
                <RatingBlock
                    title="Rate the assistant response:"
                    value={value}
                    onChange={setValue}
                    size="l"
                />
            </ContentWrapper>
        );
    },
    decorators: defaultDecorators,
};

export const WithRating: Story = {
    render: () => {
        const [value, setValue] = useState<number | undefined>(4);

        return (
            <ContentWrapper width="450px">
                <RatingBlock
                    title="Rate the assistant response:"
                    value={value}
                    onChange={setValue}
                    size="l"
                />
            </ContentWrapper>
        );
    },
    decorators: defaultDecorators,
};

export const DynamicTitle: Story = {
    render: () => {
        const [value, setValue] = useState<number | undefined>(undefined);

        return (
            <ContentWrapper width="450px">
                <RatingBlock
                    title={
                        value && value <= 2 ? (
                            <>
                                What went wrong?{' '}
                                <a href="#feedback" onClick={(e) => e.preventDefault()}>
                                    Go to survey
                                </a>
                            </>
                        ) : (
                            'Rate the assistant response:'
                        )
                    }
                    value={value}
                    onChange={setValue}
                    size="l"
                />
            </ContentWrapper>
        );
    },
    decorators: defaultDecorators,
};

export const Sizes: Story = {
    render: () => {
        const [valueS, setValueS] = useState<number | undefined>(3);
        const [valueM, setValueM] = useState<number | undefined>(4);
        const [valueL, setValueL] = useState<number | undefined>(5);

        return (
            <Showcase>
                <ShowcaseItem title="Size S">
                    <ContentWrapper width="450px">
                        <RatingBlock
                            title="Rate the assistant response:"
                            value={valueS}
                            onChange={setValueS}
                            size="s"
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Size M">
                    <ContentWrapper width="450px">
                        <RatingBlock
                            title="Rate the assistant response:"
                            value={valueM}
                            onChange={setValueM}
                            size="m"
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Size L">
                    <ContentWrapper width="450px">
                        <RatingBlock
                            title="Rate the assistant response:"
                            value={valueL}
                            onChange={setValueL}
                            size="l"
                        />
                    </ContentWrapper>
                </ShowcaseItem>
            </Showcase>
        );
    },
};

export const WithoutTitle: Story = {
    render: () => {
        const [value, setValue] = useState<number | undefined>(3);

        return (
            <ContentWrapper width="450px">
                <RatingBlock value={value} onChange={setValue} size="l" />
            </ContentWrapper>
        );
    },
    decorators: defaultDecorators,
};

export const MultipleBlocks: Story = {
    render: () => {
        const [rating1, setRating1] = useState<number | undefined>(undefined);
        const [rating2, setRating2] = useState<number | undefined>(4);
        const [rating3, setRating3] = useState<number | undefined>(2);

        return (
            <Showcase>
                <ShowcaseItem title="Not rated">
                    <ContentWrapper width="450px">
                        <RatingBlock
                            title="How helpful was this response?"
                            value={rating1}
                            onChange={setRating1}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Positive rating">
                    <ContentWrapper width="450px">
                        <RatingBlock
                            title="How helpful was this response?"
                            value={rating2}
                            onChange={setRating2}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Low rating with link">
                    <ContentWrapper width="450px">
                        <RatingBlock
                            title={
                                <>
                                    What went wrong?{' '}
                                    <a href="#feedback" onClick={(e) => e.preventDefault()}>
                                        Go to survey
                                    </a>
                                </>
                            }
                            value={rating3}
                            onChange={setRating3}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
            </Showcase>
        );
    },
};

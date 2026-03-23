import {useState} from 'react';

import {Text} from '@gravity-ui/uikit';
import type {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {FeedbackForm, type FeedbackFormProps} from '../FeedbackForm';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/FeedbackForm',
    component: FeedbackForm,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        onSubmit: {action: 'submitted'},
    },
} as Meta;

type Story = StoryObj<typeof FeedbackForm>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const defaultOptions = [
    {id: 'no-answer', label: 'No answer'},
    {id: 'not-helpful', label: 'Not helpful'},
    {id: 'wrong-info', label: 'Wrong information'},
    {id: 'other', label: 'Other'},
];

export const Playground: StoryFn<FeedbackFormProps> = (args) => (
    <ContentWrapper width="300px">
        <FeedbackForm {...args} />
    </ContentWrapper>
);

Playground.args = {
    options: defaultOptions,
    reasonsLabel: 'What went wrong?',
    commentPlaceholder: 'Tell us more...',
    submitLabel: 'Submit',
    onSubmit: (reasons, comment) => {
        console.log('Reasons:', reasons, 'Comment:', comment);
    },
};

export const Default: Story = {
    render: () => (
        <ShowcaseItem title="Default">
            <ContentWrapper width="300px">
                <FeedbackForm
                    options={defaultOptions}
                    onSubmit={(reasons, comment) => {
                        console.log('Reasons:', reasons);
                        console.log('Comment:', comment);
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithCustomLabels: Story = {
    render: () => (
        <ShowcaseItem title="Custom Labels">
            <ContentWrapper width="300px">
                <FeedbackForm
                    options={[
                        {id: 'bug', label: 'Bug'},
                        {id: 'feature', label: 'Feature Request'},
                        {id: 'improvement', label: 'Improvement'},
                    ]}
                    reasonsLabel="What type of feedback?"
                    commentLabel="Additional details"
                    commentPlaceholder="Describe your feedback..."
                    submitLabel="Send Feedback"
                    onSubmit={(reasons, comment) => {
                        console.log('Submitted:', {reasons, comment});
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const ManyOptions: Story = {
    render: () => (
        <ShowcaseItem title="Many Options">
            <ContentWrapper width="300px">
                <FeedbackForm
                    options={[
                        {id: 'no-answer', label: 'No answer'},
                        {id: 'not-helpful', label: 'Not helpful'},
                        {id: 'wrong-info', label: 'Wrong information'},
                        {id: 'incomplete', label: 'Incomplete answer'},
                        {id: 'outdated', label: 'Outdated information'},
                        {id: 'offensive', label: 'Offensive content'},
                        {id: 'unclear', label: 'Unclear'},
                        {id: 'other', label: 'Other'},
                    ]}
                    reasonsLabel="What went wrong?"
                    commentPlaceholder="Tell us more..."
                    submitLabel="Submit"
                    onSubmit={(reasons, comment) => {
                        console.log('ManyOptions submitted:', {reasons, comment});
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const InteractiveDemo: Story = {
    render: () => {
        const [submitted, setSubmitted] = useState(false);
        const [result, setResult] = useState<{reasons: string[]; comment: string} | null>(null);

        const handleSubmit = (reasons: string[], comment: string) => {
            setResult({reasons, comment});
            setSubmitted(true);

            setTimeout(() => {
                setSubmitted(false);
                setResult(null);
            }, 3000);
        };

        return (
            <ShowcaseItem title="Interactive Demo">
                <ContentWrapper width="300px">
                    {!submitted ? (
                        <FeedbackForm
                            options={defaultOptions}
                            reasonsLabel="What went wrong?"
                            commentPlaceholder="Tell us more..."
                            submitLabel="Submit"
                            onSubmit={handleSubmit}
                        />
                    ) : (
                        <div style={{textAlign: 'center', padding: '20px'}}>
                            <Text variant="header-1">Thank you for your feedback!</Text>
                            <Text variant="body-2" style={{display: 'block', marginTop: '12px'}}>
                                <strong>Selected reasons:</strong>
                                {'\n'}
                                {result?.reasons.join(', ') || 'None'}
                            </Text>
                            {result?.comment && (
                                <Text variant="body-2" style={{display: 'block', marginTop: '8px'}}>
                                    <strong>Comment:</strong>
                                    {'\n'}
                                    {result.comment}
                                </Text>
                            )}
                        </div>
                    )}
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const Disabled: Story = {
    render: () => (
        <ShowcaseItem title="Disabled">
            <ContentWrapper width="300px">
                <FeedbackForm
                    options={defaultOptions}
                    reasonsLabel="What went wrong?"
                    commentPlaceholder="Tell us more..."
                    submitLabel="Submit"
                    disabled
                    onSubmit={(reasons, comment) => {
                        console.log('Disabled submitted:', {reasons, comment});
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithCommentLabel: Story = {
    render: () => (
        <ShowcaseItem title="With Comment Label">
            <ContentWrapper width="300px">
                <FeedbackForm
                    options={defaultOptions}
                    reasonsLabel="What went wrong?"
                    commentLabel="Additional information"
                    commentPlaceholder="Describe the issue in detail"
                    submitLabel="Submit"
                    onSubmit={(reasons, comment) => {
                        console.log('WithCommentLabel submitted:', {reasons, comment});
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithoutComment: Story = {
    render: () => (
        <ShowcaseItem title="Without Comment">
            <ContentWrapper width="300px">
                <FeedbackForm
                    options={defaultOptions}
                    reasonsLabel="What went wrong?"
                    showComment={false}
                    submitLabel="Submit"
                    onSubmit={(reasons) => {
                        console.log('WithoutComment submitted:', {reasons});
                    }}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

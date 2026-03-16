import {useState} from 'react';

import {Text} from '@gravity-ui/uikit';
import type {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {FeedbackForm, type FeedbackFormProps} from '../FeedbackForm';

const meta: Meta<typeof FeedbackForm> = {
    title: 'molecules/FeedbackForm',
    component: FeedbackForm,
    argTypes: {
        onSubmit: {action: 'submitted'},
    },
};

export default meta;

type Story = StoryObj<typeof FeedbackForm>;

const defaultOptions = [
    {id: 'no-answer', label: 'No answer'},
    {id: 'not-helpful', label: 'Not helpful'},
    {id: 'wrong-info', label: 'Wrong information'},
    {id: 'other', label: 'Other'},
];

export const Playground: StoryFn<FeedbackFormProps> = (args) => <FeedbackForm {...args} />;

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
        <div style={{maxWidth: '300px'}}>
            <FeedbackForm
                options={defaultOptions}
                onSubmit={(reasons, comment) => {
                    console.log('Reasons:', reasons);
                    console.log('Comment:', comment);
                }}
            />
        </div>
    ),
};

export const WithCustomLabels: Story = {
    render: () => (
        <div style={{maxWidth: '300px'}}>
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
        </div>
    ),
};

export const ManyOptions: Story = {
    render: () => (
        <div style={{maxWidth: '300px'}}>
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
        </div>
    ),
};

export const InteractiveDemo: Story = {
    render: () => {
        const [submitted, setSubmitted] = useState(false);
        const [result, setResult] = useState<{reasons: string[]; comment: string} | null>(null);

        const handleSubmit = (reasons: string[], comment: string) => {
            setResult({reasons, comment});
            setSubmitted(true);

            // Reset after 3 seconds
            setTimeout(() => {
                setSubmitted(false);
                setResult(null);
            }, 3000);
        };

        return (
            <div style={{maxWidth: '300px'}}>
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
                        <Text variant="header-1" style={{marginBottom: '12px'}}>
                            Thank you for your feedback!
                        </Text>
                        <Text variant="body-2" style={{color: 'var(--g-color-text-secondary)'}}>
                            Selected reasons: {result?.reasons.length || 0}
                        </Text>
                        {result?.comment && (
                            <Text
                                variant="body-2"
                                style={{
                                    marginTop: '8px',
                                    color: 'var(--g-color-text-secondary)',
                                }}
                            >
                                Comment: {result.comment}
                            </Text>
                        )}
                    </div>
                )}
            </div>
        );
    },
};

export const Disabled: Story = {
    render: () => (
        <div style={{maxWidth: '300px'}}>
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
        </div>
    ),
};

export const WithCommentLabel: Story = {
    render: () => (
        <div style={{maxWidth: '300px'}}>
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
        </div>
    ),
};

export const WithoutComment: Story = {
    render: () => (
        <div style={{maxWidth: '300px'}}>
            <FeedbackForm
                options={defaultOptions}
                reasonsLabel="What went wrong?"
                showComment={false}
                submitLabel="Submit"
                onSubmit={(reasons) => {
                    console.log('WithoutComment submitted:', {reasons});
                }}
            />
        </div>
    ),
};

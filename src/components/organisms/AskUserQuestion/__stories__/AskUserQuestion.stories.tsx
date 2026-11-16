import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {AskUserQuestion} from '..';
import type {AskUserQuestionAnswer, AskUserQuestionProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/AskUserQuestion',
    component: AskUserQuestion,
    parameters: {docs: {page: MDXDocs}},
} as Meta<typeof AskUserQuestion>;

type Story = StoryObj<typeof AskUserQuestion>;
const options = [
    {
        id: 'shared',
        title: 'Shared',
        recommended: true,
        description: 'Use one accent color across all workspaces. Changes apply everywhere.',
    },
    {
        id: 'independent',
        title: 'Independent',
        description: 'Each workspace has its own accent color without affecting the others.',
    },
];

const demoQuestions = [
    {question: '', options},
    {
        question: 'When should the accent color change take effect?',
        options: [
            {
                id: 'immediately',
                title: 'Immediately',
                recommended: true,
                description: 'Apply changes as soon as the user selects a color.',
            },
            {
                id: 'on-save',
                title: 'After saving',
                description: 'Apply changes only when the user confirms the settings.',
            },
        ],
    },
    {
        question: 'Which theme should the preview use?',
        options: [
            {
                id: 'system',
                title: 'System theme',
                recommended: true,
                description: 'Follow the appearance settings of the device.',
            },
            {
                id: 'light',
                title: 'Light',
                description: 'Always show the preview in the light theme.',
            },
            {id: 'dark', title: 'Dark', description: 'Always show the preview in the dark theme.'},
        ],
    },
];

function InteractiveQuestion(args: AskUserQuestionProps) {
    const [index, setIndex] = useState(args.questionIndex ?? 0);
    const [answers, setAnswers] = useState<Record<number, AskUserQuestionAnswer>>({});
    const [drafts, setDrafts] = useState<Record<number, string>>({});
    const current = demoQuestions[index % demoQuestions.length];
    const answer = answers[index];
    const [closed, setClosed] = useState(false);
    return closed ? (
        <div role="status">Question closed</div>
    ) : (
        <>
            <AskUserQuestion
                {...args}
                question={index === 0 ? args.question : current.question}
                options={index === 0 ? args.options : current.options}
                customAnswer={drafts[index] ?? (index === 0 ? args.customAnswer : '') ?? ''}
                onCustomAnswerChange={(value) =>
                    setDrafts((previous) => ({...previous, [index]: value}))
                }
                questionIndex={index}
                onQuestionChange={setIndex}
                onClose={() => setClosed(true)}
                selectedAnswer={answer ?? args.selectedAnswer}
                answeredQuestionIndices={
                    args.answeredQuestionIndices === undefined
                        ? undefined
                        : Object.keys(answers).map(Number)
                }
                onAnswer={(value) => setAnswers((previous) => ({...previous, [index]: value}))}
            />
            {answer && (
                <div role="status">{answer.type === 'option' ? answer.optionId : answer.value}</div>
            )}
        </>
    );
}

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="480px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        question: 'Should all workspaces share the same accent color or use separate settings?',
        options,
        questionCount: 3,
        questionIndex: 0,
    },
    render: (args) => <InteractiveQuestion {...args} />,
    decorators: defaultDecorators,
};

export const CustomAnswerFilled: Story = {
    ...Playground,
    args: {...Playground.args, customAnswer: 'Use a separate accent color for each workspace.'},
};

export const WithoutCustomAnswer: Story = {
    ...Playground,
    args: {...Playground.args, allowCustomAnswer: false},
};

export const WithoutShortcuts: Story = {
    ...Playground,
    args: {...Playground.args, showShortcuts: false, questionCount: 1},
};

export const Narrow: Story = {
    ...Playground,
    decorators: [
        (Story) => (
            <ContentWrapper width="300px">
                <Story />
            </ContentWrapper>
        ),
    ],
};

export const SingleQuestion: Story = {
    ...Playground,
    args: {...Playground.args, questionCount: 1},
};

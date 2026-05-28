import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../demo/ContentWrapper';
import {buildAIContextSystemPrompt} from '../buildAIContextSystemPrompt';
import {AIPrompt} from '../templateStrings';
import type {AIDataEntry} from '../types';

const sampleEntries: AIDataEntry[] = [
    {it: 'Current user', data: {name: 'Alice', email: 'alice@example.com', role: 'admin'}},
    {it: 'Current page', data: {title: 'Product Dashboard', section: 'Analytics'}},
];

const variable = 42;

const someExtraneuosCode = (v: number) => `Some extraneuos code: variable - ${v}`;

const customTemplate = AIPrompt`Here are example of custom template. Data already provided:

${(entries, options) => entries.map((entry) => `### ${entry.it}:\n${options.formatData(entry.data)}`)}

${someExtraneuosCode(variable)}
`;

function PromptPreview({prompt}: {prompt: string}) {
    return (
        <pre
            style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '13px',
                margin: 0,
            }}
        >
            {prompt || '(empty — no entries. There is nothing to pass to LLM)'}
        </pre>
    );
}

function BuildPromptExample({
    entries,
    formatData,
    template,
}: {
    entries: AIDataEntry[];
    formatData?: (data: unknown) => string;
    template?: ReturnType<typeof AIPrompt>;
}) {
    const prompt = buildAIContextSystemPrompt(entries, {formatData, template});

    return <PromptPreview prompt={prompt} />;
}

export default {
    title: 'utils/AIAgentContext/buildAIContextSystemPrompt',
} as Meta;

type Story = StoryObj<typeof BuildPromptExample>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const DefaultTemplate: Story = {
    render: () => <BuildPromptExample entries={sampleEntries} />,
    decorators: defaultDecorators,
};

export const CustomTemplate: Story = {
    render: () => <BuildPromptExample entries={sampleEntries} template={customTemplate} />,
    decorators: defaultDecorators,
};

export const CustomFormatData: Story = {
    render: () => (
        <BuildPromptExample
            entries={sampleEntries}
            formatData={(data) => JSON.stringify(data, null, 2)}
        />
    ),
    decorators: defaultDecorators,
};

export const EmptyEntries: Story = {
    render: () => <BuildPromptExample entries={[]} />,
    decorators: defaultDecorators,
};

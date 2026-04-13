// src/utils/aiAgentContext/__stories__/AIAgentContext.stories.tsx

import {useEffect, useRef, useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {AIAgentContextProvider, AIData, buildAIContextSystemPrompt, useAIAgentContext} from '..';
import {ContentWrapper} from '../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

function useForceUpdateEachSecond() {
    const [tick, setTick] = useState<number>(0);

    const tickRef = useRef<number>(tick);
    tickRef.current = tick;
    const interval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        interval.current = setInterval(() => {
            setTick(tickRef.current + 1);
        }, 1000);

        return () => {
            if (interval.current) {
                clearInterval(interval.current);
            }
        };
    }, []);

    return tick;
}

function PromptPreview() {
    const {getData} = useAIAgentContext();
    const entries = getData();
    const prompt = buildAIContextSystemPrompt(entries);

    const tick = useForceUpdateEachSecond();

    return (
        <pre
            style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '13px',
            }}
        >
            {prompt || '(no data registered)'}

            <br />
            <br />

            <small>Force updating each second: {tick}</small>
        </pre>
    );
}

function BasicUsageExample() {
    const product = {
        id: 42,
        name: 'Gravity UI Kit',
        price: 0,
        category: 'Open Source',
    };

    return (
        <AIAgentContextProvider>
            <AIData it="Current product" data={product} />
            <PromptPreview />
        </AIAgentContextProvider>
    );
}

function MultipleDataSourcesExample() {
    const user = {name: 'Alice', email: 'alice@example.com', role: 'admin'};
    const page = {title: 'Product Dashboard', section: 'Analytics'};
    const filters = {dateRange: '2026-01-01 to 2026-04-13', status: 'active'};

    return (
        <AIAgentContextProvider>
            <AIData it="Current user" data={user} />
            <AIData it="Current page" data={page} />
            <AIData it="Applied filters" data={filters} />
            <PromptPreview />
        </AIAgentContextProvider>
    );
}

function DynamicDataExample({userName, userEmail}: {userName: string; userEmail: string}) {
    const [counter, setCounter] = useState(0);

    return (
        <AIAgentContextProvider>
            <AIData it="Current user" data={{name: userName, email: userEmail}} />
            <AIData it="Session state" data={{clickCount: counter}} />
            <div style={{marginBottom: '12px'}}>
                <button onClick={() => setCounter((c) => c + 1)}>Clicked {counter} times</button>
            </div>
            <PromptPreview />
        </AIAgentContextProvider>
    );
}

export default {
    title: 'utils/AIAgentContext',
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type BasicStory = StoryObj<typeof BasicUsageExample>;
type MultiStory = StoryObj<typeof MultipleDataSourcesExample>;
type DynamicStory = StoryObj<typeof DynamicDataExample>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper>
            <Story />
        </ContentWrapper>
    ),
] satisfies BasicStory['decorators'];

export const BasicUsage: BasicStory = {
    render: () => <BasicUsageExample />,
    decorators: defaultDecorators,
};

export const MultipleDataSources: MultiStory = {
    render: () => <MultipleDataSourcesExample />,
    decorators: defaultDecorators,
};

export const DynamicData: DynamicStory = {
    render: (args) => <DynamicDataExample {...args} />,
    args: {
        userName: 'Alice',
        userEmail: 'alice@example.com',
    },
    decorators: defaultDecorators,
};

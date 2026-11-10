import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {RunActivity} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'experimental/RunActivity',
    component: RunActivity,
    argTypes: {showIcon: {control: 'boolean'}},
    parameters: {docs: {page: MDXDocs}},
} satisfies Meta<typeof RunActivity>;
type Story = StoryObj<typeof RunActivity>;
export const Playground: Story = {
    args: {
        id: 'run-1',
        showIcon: true,
        state: 'running',
        durationMs: 4000,
        currentAction: {label: 'Read'},
        steps: [
            {
                id: 'reasoning',
                kind: 'thinking',
                props: {
                    status: 'thought',
                    content: 'Check the implementation before changing the boundary.',
                    defaultExpanded: false,
                },
            },
            {
                id: 'tool-call-1',
                kind: 'tool',
                props: {
                    toolName: 'Read',
                    secondaryText: 'products.ts',
                    contextTooltip: 'src/api/products.ts',
                    status: 'success',
                    bodyContent: <pre>return items.slice(start, end);</pre>,
                },
            },
        ],
    },
};
export const Completed: Story = {
    args: {...Playground.args, state: 'completed', defaultExpanded: true},
};
export const Cancelled: Story = {args: {...Playground.args, state: 'cancelled'}};
export const Error: Story = {
    args: {
        ...Playground.args,
        state: 'error',
        attention: <div role="alert">The request failed. Retry from the host.</div>,
    },
};
export const NeedsInput: Story = {
    args: {...Playground.args, state: 'needs-input', attention: <button>Approve change</button>},
};

export const WithoutIcons: Story = {args: {...Completed.args, showIcon: false}};

import {useState} from 'react';

import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {fn} from 'storybook/test';

import {PlanProgress} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'experimental/PlanProgress',
    component: PlanProgress,
    parameters: {docs: {page: MDXDocs}},
} satisfies Meta<typeof PlanProgress>;

type Story = StoryObj<typeof PlanProgress>;

export const Playground: Story = {
    args: {
        status: 'running',
        steps: [
            {id: 'page', title: 'Build the event page', status: 'completed', elapsedLabel: '0:42'},
            {id: 'form', title: 'Add the registration form', status: 'running'},
            {id: 'preview', title: 'Verify registration in the preview', status: 'pending'},
        ],
    },
};

export const WithCancel: Story = {
    args: {...Playground.args, onCancel: fn()},
    render: function Render(args) {
        const [cancelled, setCancelled] = useState(false);
        const steps = cancelled
            ? args.steps.map((step) =>
                  step.status === 'running' ? {...step, status: 'cancelled' as const} : step,
              )
            : args.steps;

        return (
            <PlanProgress
                {...args}
                steps={steps}
                status={cancelled ? 'cancelled' : args.status}
                onCancel={() => {
                    setCancelled(true);
                    args.onCancel?.();
                }}
            />
        );
    },
};

export const Completed: Story = {
    args: {
        status: 'completed',
        steps: Playground.args?.steps?.map((step) => ({...step, status: 'completed'})) ?? [],
    },
};

export const ResultCard: Story = {
    args: {...Completed.args, view: 'card', onOpenPreview: fn()},
};

export const Overflow: Story = {
    args: {
        status: 'running',
        onStepClick: fn(),
        steps: [
            'Review the event brief',
            'Outline the page structure',
            'Create the page layout',
            'Add the event details',
            'Build the session schedule',
            'Add speaker profiles',
            'Add venue information',
            'Create the registration form',
            'Validate required fields',
            'Show registration confirmation',
            'Check the mobile layout',
            'Verify keyboard navigation',
            'Review accessibility',
            'Test form submission',
            'Review the final preview',
        ].map((title, index) => ({
            id: `event-step-${index + 1}`,
            elapsedLabel: index <= 8 ? `0:${32 + index}` : undefined,
            title,
            status: index < 8 ? 'completed' : index === 8 ? 'running' : 'pending',
        })),
    },
};

export const OverflowWithError: Story = {
    args: {
        ...Overflow.args,
        status: 'failed',
        steps:
            Overflow.args?.steps?.map((step, index) => {
                if (index < 7) {
                    return step;
                }
                return {
                    ...step,
                    elapsedLabel: index === 7 ? step.elapsedLabel : undefined,
                    status: index === 7 ? 'failed' : 'pending',
                };
            }) ?? [],
    },
};

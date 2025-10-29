import {Meta, StoryFn} from '@storybook/react';
import {ContextIndicator, type ContextIndicatorProps} from '..';
import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/ContextIndicator',
    component: ContextIndicator,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        type: {
            control: 'radio',
            options: ['number', 'percent'],
            description: 'Whether to use direct percentage or calculate from numbers',
        },
        usedContext: {
            control: 'number',
            description: 'Current context usage (percentage or absolute number)',
        },
        maxContext: {
            control: 'number',
            description: 'Maximum context available (only for type="number")',
            if: {arg: 'type', eq: 'number'},
        },
        orientation: {
            control: 'radio',
            options: ['horizontal', 'vertical'],
            description: 'Layout orientation of the indicator',
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

export const Playground: StoryFn<ContextIndicatorProps> = (args) => <ContextIndicator {...args} />;
Playground.args = {
    type: 'number',
    usedContext: 50,
    maxContext: 100,
};

export const Empty = () => <ContextIndicator type="percent" usedContext={0} />;
export const Quarter = () => <ContextIndicator type="percent" usedContext={25} />;
export const Half = () => <ContextIndicator type="percent" usedContext={50} />;
export const ThreeQuarters = () => <ContextIndicator type="percent" usedContext={75} />;
export const Full = () => <ContextIndicator type="percent" usedContext={100} />;

export const WithNumber = () => (
    <ContextIndicator type="number" usedContext={50} maxContext={100} />
);
export const WithNumberHalf = () => (
    <ContextIndicator type="number" usedContext={500} maxContext={1000} />
);

export const AllStates = () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <div style={{textAlign: 'center'}}>
            <ContextIndicator type="percent" usedContext={0} />
        </div>
        <div style={{textAlign: 'center'}}>
            <ContextIndicator type="percent" usedContext={25} />
        </div>
        <div style={{textAlign: 'center'}}>
            <ContextIndicator type="percent" usedContext={50} />
        </div>
        <div style={{textAlign: 'center'}}>
            <ContextIndicator type="percent" usedContext={75} />
        </div>
        <div style={{textAlign: 'center'}}>
            <ContextIndicator type="percent" usedContext={100} />
        </div>
    </div>
);

export const VerticalOrientation = () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
        <ContextIndicator type="percent" usedContext={0} orientation="vertical" />
        <ContextIndicator type="percent" usedContext={25} orientation="vertical" />
        <ContextIndicator type="percent" usedContext={50} orientation="vertical" />
        <ContextIndicator type="percent" usedContext={75} orientation="vertical" />
        <ContextIndicator type="percent" usedContext={100} orientation="vertical" />
    </div>
);

export const VerticalWithNumber = () => (
    <div style={{display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
        <ContextIndicator
            type="number"
            usedContext={500}
            maxContext={1000}
            orientation="vertical"
        />
    </div>
);

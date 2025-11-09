import {Meta, StoryFn} from '@storybook/react-webpack5';

import {ContextIndicator, type ContextIndicatorProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

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
        reversed: {
            control: 'boolean',
            description: 'Reverses the order of value and progress bar',
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

export const Playground: StoryFn<ContextIndicatorProps> = (args) => (
    <ContentWrapper>
        <ContextIndicator {...args} />
    </ContentWrapper>
);
Playground.args = {
    type: 'number',
    usedContext: 50,
    maxContext: 100,
};

export const Empty = () => (
    <ContentWrapper>
        <ContextIndicator type="percent" usedContext={0} />
    </ContentWrapper>
);
export const Quarter = () => (
    <ContentWrapper>
        <ContextIndicator type="percent" usedContext={25} />
    </ContentWrapper>
);
export const Half = () => (
    <ContentWrapper>
        <ContextIndicator type="percent" usedContext={50} />
    </ContentWrapper>
);
export const ThreeQuarters = () => (
    <ContentWrapper>
        <ContextIndicator type="percent" usedContext={75} />
    </ContentWrapper>
);
export const Full = () => (
    <ContentWrapper>
        <ContextIndicator type="percent" usedContext={100} />
    </ContentWrapper>
);

export const WithNumber = () => (
    <ContentWrapper>
        <ContextIndicator type="number" usedContext={50} maxContext={100} />
    </ContentWrapper>
);
export const WithNumberHalf = () => (
    <ContentWrapper>
        <ContextIndicator type="number" usedContext={500} maxContext={1000} />
    </ContentWrapper>
);

export const AllStates = () => (
    <ContentWrapper>
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
    </ContentWrapper>
);

export const VerticalOrientation = () => (
    <ContentWrapper>
        <div style={{display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
            <ContextIndicator type="percent" usedContext={0} orientation="vertical" />
            <ContextIndicator type="percent" usedContext={25} orientation="vertical" />
            <ContextIndicator type="percent" usedContext={50} orientation="vertical" />
            <ContextIndicator type="percent" usedContext={75} orientation="vertical" />
            <ContextIndicator type="percent" usedContext={100} orientation="vertical" />
        </div>
    </ContentWrapper>
);

export const VerticalWithNumber = () => (
    <ContentWrapper>
        <div style={{display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
            <ContextIndicator
                type="number"
                usedContext={500}
                maxContext={1000}
                orientation="vertical"
            />
        </div>
    </ContentWrapper>
);

export const AllReversedVariants = () => (
    <ContentWrapper>
        <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
            <div>
                <h4 style={{marginBottom: '16px'}}>Horizontal Reversed</h4>
                <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                    <ContextIndicator type="percent" usedContext={0} reversed />
                    <ContextIndicator type="percent" usedContext={25} reversed />
                    <ContextIndicator type="percent" usedContext={50} reversed />
                    <ContextIndicator type="percent" usedContext={75} reversed />
                    <ContextIndicator type="percent" usedContext={100} reversed />
                </div>
            </div>
            <div>
                <h4 style={{marginBottom: '16px'}}>Vertical Reversed</h4>
                <div style={{display: 'flex', gap: '16px', alignItems: 'flex-start'}}>
                    <ContextIndicator
                        type="percent"
                        usedContext={0}
                        orientation="vertical"
                        reversed
                    />
                    <ContextIndicator
                        type="percent"
                        usedContext={25}
                        orientation="vertical"
                        reversed
                    />
                    <ContextIndicator
                        type="percent"
                        usedContext={50}
                        orientation="vertical"
                        reversed
                    />
                    <ContextIndicator
                        type="percent"
                        usedContext={75}
                        orientation="vertical"
                        reversed
                    />
                    <ContextIndicator
                        type="percent"
                        usedContext={100}
                        orientation="vertical"
                        reversed
                    />
                </div>
            </div>
        </div>
    </ContentWrapper>
);

export const GrayColors = () => (
    <ContentWrapper>
        <div
            style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                // Override all progress colors to gray
                ['--g-aikit-ci-color-progress-1' as string]: '#999999',
                ['--g-aikit-ci-color-progress-2' as string]: '#999999',
                ['--g-aikit-ci-color-progress-3' as string]: '#999999',
            }}
        >
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
    </ContentWrapper>
);

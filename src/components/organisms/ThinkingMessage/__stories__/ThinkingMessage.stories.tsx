import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ThinkingMessage, type ThinkingMessageProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {ThinkingMessageData} from '../useThinkingMessage';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/ThinkingMessage',
    component: ThinkingMessage,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        data: {
            control: 'object',
            description: 'Thinking message data',
        },
        defaultExpanded: {
            control: 'boolean',
            description: 'Initial expanded state',
        },
        showStatusIndicator: {
            control: 'boolean',
            description: 'Show loader when status is "thinking"',
        },
        className: {
            control: 'text',
            description: 'Class name',
        },
        qa: {
            control: 'text',
            description: 'QA attribute',
        },
        style: {
            control: 'object',
            description: 'Style',
        },
        onCopyClick: {
            action: 'copy clicked',
            description: 'Copy button click handler',
        },
    },
} as Meta;

type Story = StoryObj<typeof ThinkingMessage>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const thinkingData: ThinkingMessageData = {
    data: {
        content: [
            'Lore ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Lore ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        ],
        status: 'thinking',
    },
};

const thoughtData: ThinkingMessageData = {
    data: {
        content: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        ],
        status: 'thought',
    },
};

export const Playground: StoryFn<ThinkingMessageProps> = (args) => (
    <ContentWrapper width="600px">
        <ThinkingMessage {...args} />
    </ContentWrapper>
);
Playground.args = {
    ...thinkingData,
    defaultExpanded: true,
    showStatusIndicator: true,
};

export const ThinkingState: StoryObj<ThinkingMessageProps> = {
    render: () => (
        <ShowcaseItem title="Thinking State (with loader)">
            <ContentWrapper width="600px">
                <ThinkingMessage
                    {...thinkingData}
                    defaultExpanded={true}
                    showStatusIndicator={true}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const ThoughtState: StoryObj<ThinkingMessageProps> = {
    render: () => (
        <ShowcaseItem title="Thought State (completed)">
            <ContentWrapper width="600px">
                <ThinkingMessage
                    {...thoughtData}
                    defaultExpanded={true}
                    showStatusIndicator={true}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const SingleContent: StoryObj<ThinkingMessageProps> = {
    render: () => (
        <ShowcaseItem title="Single Content String">
            <ContentWrapper width="600px">
                <ThinkingMessage
                    data={{
                        content: 'Processing your request and analyzing possible solutions.',
                        status: 'thinking',
                    }}
                    defaultExpanded={true}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const Collapsed: StoryObj<ThinkingMessageProps> = {
    render: () => (
        <ShowcaseItem title="Collapsed Initially">
            <ContentWrapper width="600px">
                <ThinkingMessage {...thoughtData} defaultExpanded={false} />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithoutLoader: StoryObj<ThinkingMessageProps> = {
    render: () => (
        <ShowcaseItem title="Without Loader (showStatusIndicator=false)">
            <ContentWrapper width="600px">
                <ThinkingMessage
                    {...thinkingData}
                    defaultExpanded={true}
                    showStatusIndicator={false}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithCopyAction: StoryObj<ThinkingMessageProps> = {
    render: () => (
        <ShowcaseItem title="With Copy Action">
            <ContentWrapper width="600px">
                <ThinkingMessage
                    {...thoughtData}
                    defaultExpanded={true}
                    onCopyClick={() => alert('Content copied to clipboard!')}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithCustomStyle: StoryObj<ThinkingMessageProps> = {
    render: (args) => (
        <ShowcaseItem title="With Custom Style">
            <ContentWrapper width="600px">
                <ThinkingMessage {...args} />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

WithCustomStyle.args = {
    ...thoughtData,
    defaultExpanded: true,
    style: {
        '--g-color-text-complementary': '#00aa00',
        '--g-color-line-generic': '#ff6b35',
        '--g-text-body-1-font-size': '16px',
        '--g-text-body-font-weight': '500',
        '--g-text-body-1-line-height': '18px',
    },
    onCopyClick: undefined,
};

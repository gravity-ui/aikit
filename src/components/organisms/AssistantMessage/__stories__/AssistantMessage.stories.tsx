import {Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {AssistantMessage, type AssistantMessageProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import type {
    AssistantMessage as AssistantMessageType,
    BaseMessagePart,
} from '../../../../types/messages';
import {
    type MessagePartComponentProps,
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../utils/messageTypeRegistry';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/AssistantMessage',
    component: AssistantMessage,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        content: {
            control: 'object',
            description: 'Message content',
        },
        actions: {
            control: 'object',
            description: 'Message actions',
        },
        timestamp: {
            control: 'text',
            description: 'Message timestamp',
        },
        id: {
            control: 'text',
            description: 'Message ID',
        },
        messageRendererRegistry: {
            control: false,
            description: 'Custom message renderer registry',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show action buttons on hover',
        },
        showTimestamp: {
            control: 'boolean',
            description: 'Show timestamp in actions area',
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

type Story = StoryObj<typeof AssistantMessage>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const simpleMessage: AssistantMessageType = {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
};

const multiPartMessage: AssistantMessageType = {
    id: '4',
    role: 'assistant',
    content: [
        {
            type: 'text',
            data: {
                text: "I'll scan the SCSS structure: global styles and mixins, theme files, and a couple of component styles. I'll also search for the custom Sass function usage and theming patterns.",
            },
        },
        {
            type: 'tool',
            data: {
                toolName: 'Reading',
                headerContent: (
                    <Text color="secondary" variant="body-1">
                        Warning.css
                    </Text>
                ),
                status: 'success',
                toolIcon: <Icon data={Pencil} />,
            },
        },
        {
            type: 'text',
            data: {
                text: 'I’m organizing which files to read first. I’ll start with the essentials like package.json, README.md, tsconfig.json, jest.config.js, and eslint.config.mjs.',
            },
        },
    ],
};

const actions = [
    {type: 'copy', onClick: () => console.log('Copy clicked')},
    {type: 'like', onClick: () => console.log('Like clicked')},
    {type: 'unlike', onClick: () => console.log('Unlike clicked')},
];

export const Playground: StoryFn<AssistantMessageProps> = (args) => (
    <ContentWrapper width="480px">
        <AssistantMessage {...args} />
    </ContentWrapper>
);
Playground.args = {
    content: simpleMessage.content,
    actions,
    timestamp: simpleMessage.timestamp,
    id: simpleMessage.id,
};

export const WithToolCall: StoryObj<AssistantMessageProps> = {
    render: (args) => (
        <ShowcaseItem title="With Tool Call">
            <ContentWrapper width="480px">
                <AssistantMessage
                    {...args}
                    content={multiPartMessage.content}
                    actions={actions}
                    timestamp={multiPartMessage.timestamp}
                    id={multiPartMessage.id}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

interface CustomMessageData {
    title: string;
    description: string;
}

type CustomMessagePart = BaseMessagePart<CustomMessageData> & {
    type: 'custom';
};

const CustomMessageView: React.FC<MessagePartComponentProps<CustomMessagePart>> = ({part}) => {
    const {title, description} = part.data;
    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid var(--g-color-line-generic)',
                borderRadius: '8px',
                backgroundColor: 'var(--g-color-base-float)',
            }}
        >
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>{title}</div>
            <div style={{color: 'var(--g-color-text-secondary)'}}>{description}</div>
        </div>
    );
};

export const WithCustomRenderer: StoryObj<AssistantMessageProps> = {
    render: (args) => {
        const customRegistry: MessageRendererRegistry = createMessageRendererRegistry();
        registerMessageRenderer<CustomMessagePart>(customRegistry, 'custom', {
            component: CustomMessageView,
        });

        const customMessage: AssistantMessageType = {
            id: '5',
            role: 'assistant',
            timestamp: '2024-01-01T00:00:04Z',
            content: [
                {
                    type: 'text',
                    data: {
                        text: "I'll scan the SCSS structure: global styles and mixins, theme files, and a couple of component styles. I'll also search for the custom Sass function usage and theming patterns.",
                    },
                },
                {
                    type: 'custom',
                    data: {
                        title: 'Custom Message',
                        description:
                            'This is a custom message part rendered with a custom renderer.',
                    },
                },
            ],
        };

        return (
            <ShowcaseItem title="With Custom Renderer">
                <ContentWrapper width="480px">
                    <AssistantMessage
                        {...args}
                        content={customMessage.content}
                        actions={actions}
                        timestamp={customMessage.timestamp}
                        id={customMessage.id}
                        messageRendererRegistry={customRegistry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

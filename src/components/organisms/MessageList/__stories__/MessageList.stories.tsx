import {Pencil} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TBaseMessagePart, TUserMessage} from '../../../../types/messages';
import {
    type MessagePartComponentProps,
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../utils/messageTypeRegistry';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/MessageList',
    component: MessageList,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        messages: {
            control: 'object',
            description: 'Array of messages to render',
        },
        messageRendererRegistry: {
            control: false,
            description: 'Custom message renderer registry',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show action buttons on hover for all messages',
        },
        showTimestamp: {
            control: 'boolean',
            description: 'Show timestamp for all messages',
        },
        showAvatar: {
            control: 'boolean',
            description: 'Show avatar for user messages',
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

const defaultDecorators = [
    (StoryComponent: StoryFn) => (
        <Showcase>
            <StoryComponent />
        </Showcase>
    ),
];

const userMessage: TUserMessage = {
    id: '1',
    role: 'user',
    timestamp: '2024-01-01T00:00:00Z',
    content: 'Hello, how are you?',
};

const assistantMessage: TAssistantMessage = {
    id: '2',
    role: 'assistant',
    timestamp: '2024-01-01T00:00:01Z',
    content: 'Hi! I am doing well, thank you for asking.',
};

export const Playground: StoryFn<MessageListProps> = (args) => (
    <ContentWrapper width="480px">
        <MessageList {...args} />
    </ContentWrapper>
);
Playground.args = {
    messages: [userMessage, assistantMessage],
};

export const WithSubmittedStatus: StoryObj<MessageListProps> = {
    render: (args) => (
        <ShowcaseItem title="With Submitted Status">
            <ContentWrapper width="480px">
                <MessageList {...args} messages={[userMessage]} status="submitted" />
            </ContentWrapper>
        </ShowcaseItem>
    ),
};

export const WithErrorMessage: StoryObj<MessageListProps> = {
    render: (args) => (
        <ShowcaseItem title="With Error Message">
            <ContentWrapper width="480px">
                <MessageList
                    {...args}
                    messages={[userMessage]}
                    status="error"
                    // eslint-disable-next-line no-console
                    onRetry={() => console.log('retry')}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
};

const toolIcon = <Icon data={Pencil} />;
const toolHeaderContent = (
    <Text color="secondary" variant="body-1">
        expectScreenshotFixture.ts
    </Text>
);

export const WithToolMessage: StoryObj<MessageListProps> = {
    render: (args) => (
        <ShowcaseItem title="With Tool Message">
            <ContentWrapper width="480px">
                <MessageList
                    {...args}
                    messages={[
                        {
                            role: 'user',
                            content:
                                'Analyze the project and suggest a better solution to implement a feature-name',
                        },
                        {
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
                                        status: 'success',
                                        toolIcon,
                                        expandable: true,
                                        headerContent: toolHeaderContent,
                                    },
                                },

                                {
                                    type: 'text',
                                    data: {
                                        text: "Absolutely! Here are some suggestions for improving the SCSS structure: \n\n- Consider organizing global styles and mixins into separate directories for better modularity. \n- Group theme files and component styles to simplify maintenance. \n- Use consistent naming patterns for custom Sass functions and variables. \n- Leverage nesting carefully to avoid deeply nested selectors and improve readability. \n- Document theming patterns to ease onboarding for new contributors.\n\nLet me know if you'd like examples or more details on any point!",
                                    },
                                },
                            ],
                        },
                    ]}
                />
            </ContentWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

interface ChartMessageData {
    chartData: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            color?: string;
        }>;
    };
    chartType: 'line' | 'bar' | 'pie';
}

type ChartMessagePart = TBaseMessagePart<ChartMessageData> & {
    type: 'chart';
};

const ChartMessageView: React.FC<MessagePartComponentProps<ChartMessagePart>> = ({part}) => {
    const {chartData, chartType} = part.data;
    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid var(--g-color-line-generic)',
                borderRadius: '8px',
                backgroundColor: 'var(--g-color-base-float)',
            }}
        >
            <div style={{marginBottom: '8px', fontWeight: 'bold'}}>Chart: {chartType}</div>
            <div style={{fontSize: '12px', color: 'var(--g-color-text-secondary)'}}>
                Labels: {chartData.labels.join(', ')}
            </div>
            <div style={{fontSize: '12px', color: 'var(--g-color-text-secondary)'}}>
                Datasets: {chartData.datasets.length}
            </div>
        </div>
    );
};

export const WithCustomMessageType: StoryObj<MessageListProps> = {
    render: (args) => {
        const customRegistry: MessageRendererRegistry = createMessageRendererRegistry();
        registerMessageRenderer<ChartMessagePart>(customRegistry, 'chart', {
            component: ChartMessageView,
        });

        return (
            <ShowcaseItem title="With Custom Message Type">
                <ContentWrapper width="480px">
                    <MessageList
                        {...args}
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content:
                                    'Hi! Can you show me the sales statistics for the first months of the year?',
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:02Z',
                                content: [
                                    {
                                        type: 'text',
                                        data: {
                                            text: 'Sure! Here is a bar chart showing sales statistics by month. As you can see, February had the highest sales.',
                                        },
                                    },
                                    {
                                        type: 'chart',
                                        data: {
                                            chartData: {
                                                labels: ['January', 'February', 'March', 'April'],
                                                datasets: [
                                                    {
                                                        label: 'Sales',
                                                        data: [12, 19, 3, 5],
                                                        color: '#0077ff',
                                                    },
                                                ],
                                            },
                                            chartType: 'bar',
                                        },
                                    },
                                ],
                            },
                        ]}
                        messageRendererRegistry={customRegistry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

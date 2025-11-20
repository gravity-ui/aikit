import React, {useRef, useState} from 'react';

import {ClockArrowRotateLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {History, HistoryProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {ChatType} from '../../../../types';
import {ActionButton} from '../../../atoms/ActionButton';

import MDXDocs from './Docs.mdx';

export default {
    title: 'templates/History',
    component: History,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

type Story = StoryObj<typeof History>;

// Generate mock chats
const generateMockChats = (count: number): ChatType[] => {
    const now = new Date();
    const chats: ChatType[] = [];

    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(i / 3); // Group 3 chats per day
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);

        chats.push({
            id: `chat-${i}`,
            name: `Chat ${i + 1}`,
            createTime: date.toISOString(),
            lastMessage:
                i % 3 === 0
                    ? `Looooooooong last message for example ellipsis from chat ${i + 1}`
                    : `Last message from chat ${i + 1}`,
            metadata: {},
        });
    }

    return chats;
};

const mockChats = generateMockChats(15);

// Wrapper component that includes trigger button, state, and History
type HistoryWithTriggerProps = Omit<HistoryProps, 'open' | 'onOpenChange' | 'anchorElement'> & {
    initialOpen?: boolean;
};

function HistoryWithTrigger({initialOpen = true, ...props}: HistoryWithTriggerProps) {
    const [open, setOpen] = useState(initialOpen);
    const anchorRef = useRef<HTMLButtonElement>(null);

    return (
        <div style={{paddingLeft: '400px'}}>
            <ActionButton
                ref={anchorRef}
                view="flat"
                size="m"
                onClick={() => setOpen(!open)}
                tooltipTitle="Chat History"
            >
                <Icon data={ClockArrowRotateLeft} size={16} />
            </ActionButton>
            <History
                {...props}
                open={open}
                onOpenChange={setOpen}
                anchorElement={anchorRef.current}
            />
        </div>
    );
}

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="600px" height="800px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    args: {
        chats: mockChats,
        searchable: true,
        groupBy: 'date',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
        onDeleteChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Delete chat:', chat);
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const WithSelectedChat: Story = {
    args: {
        chats: mockChats,
        selectedChat: mockChats[2],
        searchable: true,
        groupBy: 'date',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const WithLoadMore: Story = {
    args: {
        searchable: true,
        groupBy: 'date',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
    },
    render: (args) => {
        const [chats, setChats] = useState(mockChats.slice(0, 6));
        const [hasMore, setHasMore] = useState(true);

        const handleLoadMore = () => {
            // eslint-disable-next-line no-console
            console.log('Loading more chats...');
            const currentLength = chats.length;
            const nextChats = mockChats.slice(0, currentLength + 6);
            setChats(nextChats);
            if (nextChats.length >= mockChats.length) {
                setHasMore(false);
            }
        };

        return (
            <HistoryWithTrigger
                {...args}
                chats={chats}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithoutSearch: Story = {
    args: {
        chats: mockChats,
        searchable: false,
        groupBy: 'date',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const WithoutGrouping: Story = {
    args: {
        chats: mockChats,
        searchable: true,
        groupBy: 'none',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const WithoutActions: Story = {
    args: {
        chats: mockChats,
        searchable: true,
        groupBy: 'date',
        showActions: false,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const EmptyState: Story = {
    args: {
        chats: [],
        searchable: true,
        groupBy: 'date',
        showActions: true,
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const WithLoadMoreAndDelete: Story = {
    args: {
        chats: mockChats,
        searchable: true,
        groupBy: 'date',
        showActions: true,
        hasMore: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
        onDeleteChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Delete chat:', chat);
        },
        onLoadMore: () => {
            // eslint-disable-next-line no-console
            console.log('Load more chats');
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const Interactive: Story = {
    args: {
        searchable: true,
        groupBy: 'date',
        showActions: true,
    },
    render: (args) => {
        const [chats, setChats] = useState(mockChats);
        const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);

        const handleDeleteChat = (chat: ChatType) => {
            setChats((prev) => prev.filter((c) => c.id !== chat.id));
            if (selectedChat?.id === chat.id) {
                setSelectedChat(null);
            }
        };

        return (
            <HistoryWithTrigger
                {...args}
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                onDeleteChat={handleDeleteChat}
            />
        );
    },
    decorators: defaultDecorators,
};

export const WithCustomEmptyPlaceholder: Story = {
    args: {
        chats: [],
        searchable: true,
        groupBy: 'date',
        showActions: true,
        emptyPlaceholder: (
            <div
                style={{
                    padding: '40px',
                    color: '#999',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        fontSize: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                    }}
                >
                    💬
                </div>
                <div
                    style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                    }}
                >
                    No conversations yet
                </div>
                <div style={{fontSize: '14px'}}>Start a new chat to begin</div>
            </div>
        ),
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const WithCustomFilter: Story = {
    args: {
        chats: mockChats,
        searchable: true,
        groupBy: 'date',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
        // Custom filter that searches only in chat names (not in messages)
        filterFunction: (filter: string) => (item) => {
            if (item.type === 'date-header') {
                return true;
            }
            return item.name.toLowerCase().includes(filter.toLowerCase());
        },
    },
    render: (args) => <HistoryWithTrigger {...args} />,
    decorators: defaultDecorators,
};

export const NotForceOpen: Story = {
    args: {
        chats: mockChats,
        searchable: true,
        groupBy: 'date',
        showActions: true,
        onSelectChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Selected chat:', chat);
        },
        onDeleteChat: (chat) => {
            // eslint-disable-next-line no-console
            console.log('Delete chat:', chat);
        },
    },
    render: (args) => <HistoryWithTrigger initialOpen={false} {...args} />,
    decorators: defaultDecorators,
};

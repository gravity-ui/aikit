import {useCallback, useRef, useState} from 'react';

import {Text} from '@gravity-ui/uikit';
import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {TAssistantMessage, TUserMessage} from '../../../../../types/messages';

import {defaultDecorators} from './shared';

export const WithPreviousMessages: StoryObj<MessageListProps> = {
    render: (args) => {
        const createMessage = (num: number): TUserMessage | TAssistantMessage => {
            const isUser = num % 2 === 1;
            return {
                id: `msg-${num}`,
                role: isUser ? ('user' as const) : ('assistant' as const),
                timestamp: `2024-01-01T00:00:${String(num).padStart(2, '0')}Z`,
                content: isUser ? `User message ${num}` : `Assistant response ${num}`,
            };
        };

        const [messages, setMessages] = useState<Array<TUserMessage | TAssistantMessage>>(() =>
            Array.from({length: 10}, (_, i) => createMessage(11 + i)),
        );

        const [hasMore, setHasMore] = useState(true);
        const isLoadingRef = useRef(false);

        const handleLoadPrevious = useCallback(() => {
            if (isLoadingRef.current || !hasMore) {
                return;
            }

            isLoadingRef.current = true;

            setTimeout(() => {
                setMessages((prev) => {
                    const firstMessage = prev[0];
                    if (!firstMessage?.id) {
                        isLoadingRef.current = false;
                        return prev;
                    }

                    const firstNum = parseInt(firstMessage.id.replace('msg-', ''), 10);
                    const startNum = Math.max(1, firstNum - 5);
                    const count = firstNum - startNum;

                    if (count <= 0 || startNum >= firstNum) {
                        setHasMore(false);
                        isLoadingRef.current = false;
                        return prev;
                    }

                    const newMessages = Array.from({length: count}, (_, i) =>
                        createMessage(startNum + i),
                    );

                    if (startNum <= 1) {
                        setHasMore(false);
                    }

                    isLoadingRef.current = false;
                    return [...newMessages, ...prev];
                });
            }, 500);
        }, [hasMore]);

        return (
            <ShowcaseItem title="With Previous Messages Loading">
                <ContentWrapper width="480px" height="400px" display="flex">
                    <MessageList
                        {...args}
                        messages={messages}
                        hasPreviousMessages={hasMore}
                        onLoadPreviousMessages={handleLoadPrevious}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

const createComparisonMessage = (num: number): TUserMessage | TAssistantMessage => {
    const isUser = num % 2 === 1;
    return {
        id: `msg-${num}`,
        role: isUser ? 'user' : 'assistant',
        timestamp: '2024-01-01T00:00:00Z',
        content: isUser
            ? `User message ${num}`
            : `Assistant response ${num}. ${'A longer paragraph that makes the message tall enough to scroll within it. '.repeat(6)}`,
    };
};

/**
 * One side of {@link VirtualizationComparison}: a self-contained list that loads 10 older
 * messages whenever its load-more trigger comes into view (scroll to the top to fetch). A short
 * delay mimics a network round-trip and the counters expose how often the callback fires and how
 * many batches were prepended, so the plain and virtualized paths can be compared directly.
 */
const LoadPreviousComparisonPanel = ({
    virtualized,
    title,
}: {
    virtualized: boolean;
    title: string;
}) => {
    const [messages, setMessages] = useState<Array<TUserMessage | TAssistantMessage>>(() =>
        Array.from({length: 20}, (_, i) => createComparisonMessage(21 + i)),
    );
    const [hasMore, setHasMore] = useState(true);
    const [invocations, setInvocations] = useState(0);
    const [batches, setBatches] = useState(0);
    const loadingRef = useRef(false);

    const handleLoadPrevious = useCallback(() => {
        setInvocations((n) => n + 1);
        if (loadingRef.current || !hasMore) {
            return;
        }
        loadingRef.current = true;

        setTimeout(() => {
            setMessages((prev) => {
                const firstNum = parseInt(prev[0]?.id?.replace('msg-', '') ?? '1', 10);
                const startNum = Math.max(1, firstNum - 10);
                const count = firstNum - startNum;
                if (count <= 0) {
                    setHasMore(false);
                    return prev;
                }
                const older = Array.from({length: count}, (_, i) =>
                    createComparisonMessage(startNum + i),
                );
                if (startNum <= 1) {
                    setHasMore(false);
                }
                return [...older, ...prev];
            });
            setBatches((n) => n + 1);
            loadingRef.current = false;
        }, 600);
    }, [hasMore]);

    return (
        <div style={{flex: 1, minWidth: 0, maxWidth: 400}}>
            <Text variant="subheader-1" as="div">
                {virtualized ? 'Virtualized' : 'Plain'} — {title}
            </Text>
            <Text color="secondary" as="div">
                invocations: {invocations} · batches loaded: {batches}
            </Text>
            <ContentWrapper width="400px" height="400px" display="flex" boxSizing="border-box">
                <MessageList
                    messages={messages}
                    virtualized={virtualized}
                    hasPreviousMessages={hasMore}
                    onLoadPreviousMessages={handleLoadPrevious}
                />
            </ContentWrapper>
        </div>
    );
};

/**
 * Side-by-side comparison of the plain and virtualized rendering paths while older messages are
 * loaded on demand. Scroll either list to the top to prepend the next batch; both should keep the
 * viewport anchored (no jump) thanks to useScrollPreservation / useVirtualStickToBottom.
 */
export const VirtualizationComparison: StoryObj<MessageListProps> = {
    render: () => (
        <ShowcaseItem title="Plain vs Virtualized — load previous messages">
            <div style={{display: 'flex', gap: 16, width: '816px'}}>
                <LoadPreviousComparisonPanel virtualized={false} title="load previous messages" />
                <LoadPreviousComparisonPanel virtualized title="load previous messages" />
            </div>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

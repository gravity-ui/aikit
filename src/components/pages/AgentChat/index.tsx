'use client';

import {type ReactNode, useMemo, useRef, useState} from 'react';

import {registerMessageRenderer} from '../../../utils/messageTypeRegistry';
import {Header, HeaderAction, type HeaderProps} from '../../organisms/Header';
import {MessageList, type MessageListProps} from '../../organisms/MessageList';
import {RunActivity} from '../../organisms/RunActivity';
import {ChatContentV2} from '../../templates/ChatContentV2';
import {History, type HistoryProps} from '../../templates/History';

export {AgentToolAttention} from './AgentToolAttention';
export {AgentComposer} from './AgentComposer';
import {type AgentChatRun, type AgentRunContent, composeRunMessages} from './composeRunMessages';

import './AgentChat.scss';

export type {AgentRunContent, AgentChatRun} from './composeRunMessages';
const runRegistry = registerMessageRenderer<AgentRunContent>({}, 'agent-run', {
    component: ({part}) => <RunActivity {...part.data} />,
});

export interface AgentChatProps
    extends Omit<MessageListProps<AgentRunContent>, 'scrollMode' | 'virtualized'> {
    composer: ReactNode;
    /** Messages contain explicit final answers; activity is provided separately by message ID. */
    runs?: readonly AgentChatRun[];
    historyKey?: string | number;
    header?: ReactNode;
    headerProps?: HeaderProps;
    emptyContent?: ReactNode;
    chats?: HistoryProps['chats'];
    activeChat?: HistoryProps['selectedChat'];
    onSelectChat?: HistoryProps['onSelectChat'];
    onCreateChat?: () => void;
    onClose?: () => void;
}

/** Agent presentation with host-owned messages, configuration and execution. */
export function AgentChat({
    composer,
    runs = [],
    historyKey,
    header,
    headerProps,
    emptyContent,
    chats = [],
    activeChat,
    onSelectChat,
    onCreateChat,
    onClose,
    className,
    ...listProps
}: AgentChatProps) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const historyButtonRef = useRef<HTMLElement>(null);
    const messages = useMemo(
        () => composeRunMessages(listProps.messages, runs),
        [listProps.messages, runs],
    );
    return (
        <div className={`agent-chat ${className ?? ''}`}>
            <ChatContentV2
                historyKey={historyKey}
                waitingForApproval={runs.some((run) => run.activity.state === 'needs-input')}
                streaming={
                    listProps.status === 'streaming' ||
                    listProps.status === 'submitted' ||
                    listProps.status === 'streaming_loading'
                }
                composer={composer}
                header={
                    header ?? (
                        <Header
                            title="Code Assistant"
                            withIcon={false}
                            baseActions={[
                                HeaderAction.NewChat,
                                HeaderAction.History,
                                HeaderAction.Close,
                            ]}
                            {...headerProps}
                            historyButtonRef={historyButtonRef}
                            handleHistoryToggle={() => setHistoryOpen((open) => !open)}
                            handleNewChat={onCreateChat}
                            handleClose={onClose}
                        />
                    )
                }
            >
                {listProps.messages.length ? (
                    <MessageList<AgentRunContent>
                        {...listProps}
                        messages={messages}
                        messageRendererRegistry={{
                            ...runRegistry,
                            ...listProps.messageRendererRegistry,
                        }}
                        scrollMode="external"
                    />
                ) : (
                    emptyContent
                )}
            </ChatContentV2>
            <History
                chats={chats}
                selectedChat={activeChat}
                onSelectChat={onSelectChat}
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                anchorElement={historyButtonRef.current}
            />
        </div>
    );
}

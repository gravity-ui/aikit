import {useMemo, useRef, useState} from 'react';

import {Button, Checkbox, Select, Text} from '@gravity-ui/uikit';

import type {
    ChatStatus,
    PromptCommandItem,
    PromptCommandSource,
    PromptSelection,
    TChatMessage,
    TSubmitData,
} from '../../../../types';
import {ChatContainer} from '../../../pages/ChatContainer';

const documents: PromptCommandItem[] = [
    {
        id: 'architecture',
        title: 'Architecture overview',
        description: 'Engineering · Updated today',
        data: {documentId: 'doc-101', collection: 'engineering'},
    },
    {
        id: 'api',
        title: 'Public API guidelines',
        description: 'Engineering · API design and compatibility',
        data: {documentId: 'doc-102', collection: 'engineering'},
    },
    {
        id: 'release',
        title: 'Release checklist',
        description: 'Operations · Deployment and verification',
        data: {documentId: 'doc-103', collection: 'operations'},
    },
    {
        id: 'roadmap',
        title: 'Product roadmap',
        description: 'Product · Plans for the next quarter',
        data: {documentId: 'doc-104', collection: 'product'},
    },
];

/** Application-owned request mapping: AIKit does not prescribe these fields. */
function buildRequest(data: TSubmitData) {
    return {
        messages: [{role: 'user', content: data.content}],
        assistant: {
            commands:
                data.selections
                    ?.filter((item) => item.sourceId === 'commands')
                    .map((item) => ({id: item.id, ...item.data})) ?? [],
        },
        retrieval: {
            documentIds:
                data.selections
                    ?.filter((item) => item.sourceId === 'documents')
                    .map((item) => item.data?.documentId) ?? [],
        },
    };
}

export function CommandsAndContextExample() {
    const [messages, setMessages] = useState<TChatMessage[]>([]);
    const [selections, setSelections] = useState<PromptSelection[]>([]);
    const [status, setStatus] = useState<ChatStatus>('ready');
    const [view, setView] = useState<'simple' | 'full'>('full');
    const [failSend, setFailSend] = useState(false);
    const [cancelSend, setCancelSend] = useState(false);
    const [notice, setNotice] = useState('');
    const [request, setRequest] = useState<ReturnType<typeof buildRequest>>();
    const [chatKey, setChatKey] = useState(0);
    const sequence = useRef(0);
    const sources = useMemo<PromptCommandSource[]>(
        () => [
            {
                id: 'commands',
                title: 'Commands',
                trigger: '/',
                buttonLabel: 'Commands',
                items: [
                    {
                        id: 'review',
                        title: '/review',
                        description: 'Attach review instructions to the request',
                        data: {
                            mode: 'review',
                            instructions: 'Find concrete defects and suggest safe corrections.',
                        },
                    },
                    {
                        id: 'explain',
                        title: '/explain',
                        description: 'Attach explanation instructions to the request',
                        data: {
                            mode: 'explain',
                            instructions: 'Explain the design with practical examples.',
                        },
                    },
                    {
                        id: 'summary',
                        title: '/summary',
                        description: 'Insert a prompt template into the message',
                        keepSelected: false,
                        insertText: 'Summarize the selected documents and list the next steps.',
                    },
                    {
                        id: 'help',
                        title: '/help',
                        description: 'Run an application callback without attaching data',
                        keepSelected: false,
                    },
                    {
                        id: 'deploy',
                        title: '/deploy',
                        description: 'Unavailable for this account',
                        disabled: true,
                    },
                ],
                onSelect: (item) => {
                    setNotice(
                        item.id === 'help'
                            ? 'Help: choose a command, attach documents, then send a message. Commands configure assistant behavior; documents configure retrieval.'
                            : `Selected ${item.title}`,
                    );
                },
            },
            {
                id: 'documents',
                title: 'Add document context',
                trigger: '@',
                buttonLabel: 'Add context',
                getItems: async (query, {signal}) => {
                    await new Promise<void>((resolve, reject) => {
                        const timer = setTimeout(resolve, 450);
                        const onAbort = () => {
                            clearTimeout(timer);
                            reject(new Error('Aborted'));
                        };
                        signal.addEventListener('abort', onAbort, {once: true});
                        if (signal.aborted) onAbort();
                    });
                    if (query.toLowerCase() === 'error') throw new Error('Demo search error');
                    return documents.filter((item) =>
                        `${item.title} ${item.description}`
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                    );
                },
            },
        ],
        [],
    );

    const handleSend = async (data: TSubmitData): Promise<void | false> => {
        if (cancelSend) {
            setNotice('The application cancelled sending. The draft and selections are preserved.');
            return false;
        }
        setStatus('submitted');
        await new Promise((resolve) => setTimeout(resolve, 400));
        setStatus('ready');
        if (failSend) throw new Error('Demo send failure');
        const payload = buildRequest(data);
        setRequest(payload);
        const id = String(++sequence.current);
        setMessages((previous) => [
            ...previous,
            {id: `user-${id}`, role: 'user', content: data.content},
            {
                id: `assistant-${id}`,
                role: 'assistant',
                content: `Demo request accepted with **${payload.assistant.commands.length} command(s)** and **${payload.retrieval.documentIds.length} document(s)**. Inspect the request below to see where the application placed the selected data.`,
            },
        ]);
        setNotice('Request accepted. The submitted selections have been cleared.');
        return undefined;
    };

    return (
        <div
            style={{
                maxWidth: 1000,
                margin: '0 auto',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            <Text variant="header-1">Application commands and context</Text>
            <Text>
                Type /review, choose documents with @ or Add context, write a message and send it.
                /summary inserts text; /help runs an application action. No network request is sent.
            </Text>
            <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16}}>
                <Select
                    aria-label="Input layout"
                    value={[view]}
                    options={[
                        {value: 'full', content: 'Full input'},
                        {value: 'simple', content: 'Simple input'},
                    ]}
                    onUpdate={([next]) => setView(next as 'simple' | 'full')}
                />
                <Checkbox checked={failSend} onUpdate={setFailSend}>
                    Simulate send failure
                </Checkbox>
                <Checkbox checked={cancelSend} onUpdate={setCancelSend}>
                    Cancel before sending
                </Checkbox>
                <Button
                    disabled={status === 'submitted'}
                    onClick={() => {
                        setChatKey((key) => key + 1);
                        setSelections([]);
                        setMessages([]);
                        setRequest(undefined);
                        setNotice('New conversation');
                    }}
                >
                    New conversation
                </Button>
            </div>
            <div
                style={{
                    height: 500,
                    border: '1px solid var(--g-color-line-generic)',
                    borderRadius: 16,
                    overflow: 'hidden',
                }}
            >
                <ChatContainer
                    key={chatKey}
                    messages={messages}
                    status={status}
                    onSendMessage={handleSend}
                    showHistory={false}
                    showNewChat={false}
                    welcomeConfig={{
                        title: 'What would you like to work on?',
                        description:
                            'Commands configure the assistant. Context supplies the documents.',
                    }}
                    promptInputProps={{
                        view,
                        commands: {sources, selections, onSelectionsChange: setSelections},
                        bodyProps: {
                            placeholder: 'Type / for commands or @ for documents',
                            autoFocus: false,
                        },
                    }}
                />
            </div>
            <Text color="secondary">
                Try @error to see a search failure, or @missing for an empty result. Arrow keys
                navigate; Enter selects; Escape closes.
            </Text>
            <div role="status">{notice || 'Ready to choose a command or add context.'}</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
                <section style={{flex: '1 1 280px', minWidth: 0}}>
                    <Text variant="subheader-2">Current selections</Text>
                    <pre style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>
                        {JSON.stringify(selections, null, 2)}
                    </pre>
                </section>
                <section style={{flex: '1 1 360px', minWidth: 0}}>
                    <Text variant="subheader-2">Last accepted request</Text>
                    <pre style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>
                        {request
                            ? JSON.stringify(request, null, 2)
                            : 'Send a message to inspect the application request.'}
                    </pre>
                </section>
            </div>
        </div>
    );
}

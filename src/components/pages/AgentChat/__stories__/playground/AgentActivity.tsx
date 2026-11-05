import {useEffect, useMemo, useState} from 'react';

import {BookOpen, Sparkles, Terminal} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import type {AgentChatRun} from '../..';
import type {
    TChatMessage,
    TDefaultMessageContent,
    ThinkingMessageContent,
    ToolMessageContent,
} from '../../../../../types';
import {Alert} from '../../../../atoms/Alert';
import {DiffStat} from '../../../../atoms/DiffStat';
import {MarkdownRenderer} from '../../../../atoms/MarkdownRenderer';
import {type RunActivityProps, type RunActivityStep} from '../../../../organisms/RunActivity';
import {AgentToolAttention} from '../../AgentToolAttention';
import {AgentToolContext} from '../../AgentToolContext';

type DemoToolPart = ToolMessageContent & {
    data: {
        demoContext?: {
            target: string;
            pending: string;
            completed: string;
            filePath?: string;
            action?: string;
            changes?: {added: number; deleted: number};
        };
    };
};
function toolLabel(part: DemoToolPart) {
    return part.data.demoContext?.action ?? part.data.toolName;
}
function toolIcon(part: DemoToolPart) {
    return part.data.demoContext?.action === 'Read' ? (
        <Icon data={BookOpen} size={14} />
    ) : (
        (part.data.toolIcon ?? <Icon data={Terminal} size={14} />)
    );
}
type Activity = {
    parts: TDefaultMessageContent[];
    startedAt: number;
    finishedAt?: number;
    pausedAt?: number;
    pausedDuration: number;
    state: 'running' | 'completed' | 'stopped' | 'error';
};

type ActivityPart = ThinkingMessageContent & {data: {activity: Activity}};

function getActivity(part: ActivityPart, now: number): RunActivityProps {
    const {parts, startedAt, finishedAt, pausedAt, pausedDuration, state} = part.data.activity;
    const waiting = parts.find(
        (item) =>
            item.type === 'tool' &&
            (item.data.status === 'waitingConfirmation' ||
                item.data.status === 'waitingSubmission'),
    );
    const failedTool = parts.find((item) => item.type === 'tool' && item.data.status === 'error');
    const current = [...parts].reverse().find((item) => item.type !== 'text');
    const steps: RunActivityStep[] = parts.map((item) => {
        if (item.type === 'text')
            return {
                id: item.id!,
                kind: 'commentary',
                content: <MarkdownRenderer content={item.data.text} />,
            };
        if (item.type === 'thinking')
            return {
                id: item.id!,
                kind: 'thinking',
                props: {
                    ...item.data,
                    view: 'compact',
                    defaultExpanded: false,
                    icon: <Icon data={Sparkles} size={14} />,
                },
            };
        const context = (item as DemoToolPart).data.demoContext;
        return {
            id: item.id!,
            kind: 'tool',
            props: {
                ...item.data,
                toolName: toolLabel(item),
                toolIcon: toolIcon(item),
                secondaryText: (
                    <>
                        <AgentToolContext
                            text={
                                item.data.status === 'success'
                                    ? context?.completed
                                    : context?.pending
                            }
                            path={context?.filePath}
                        />
                        {item.data.status === 'success' && context?.changes && (
                            <DiffStat
                                {...context.changes}
                                style={{display: 'inline-flex', marginInlineStart: 4}}
                            />
                        )}
                    </>
                ),
                contextTooltip: context?.filePath
                    ? context.target
                    : item.data.status === 'success'
                      ? context?.completed
                      : context?.pending,
                headerContent: undefined,
                initialExpanded: item.data.status === 'error',
                autoCollapseOnSuccess: false,
                autoCollapseOnCancelled: false,
                attentionPlacement: 'external',
            },
        };
    });
    let activityState: RunActivityProps['state'] = state === 'stopped' ? 'cancelled' : state;
    if (waiting) activityState = 'needs-input';
    if (pausedAt !== undefined && !waiting) activityState = 'paused';
    return {
        id: part.id!,
        steps,
        state: activityState,
        durationMs: Math.max(0, (pausedAt ?? finishedAt ?? now) - startedAt - pausedDuration),
        currentAction: {
            label: current?.type === 'tool' ? toolLabel(current) : 'Thinking',
            icon: current?.type === 'tool' ? toolIcon(current) : <Icon data={Sparkles} size={14} />,
        },
        label:
            pausedAt !== undefined && !waiting
                ? `Paused · ${current?.type === 'tool' ? toolLabel(current) : 'Thinking'}`
                : state === 'completed' && failedTool
                  ? 'Completed with recovery · 1 tool failed'
                  : undefined,
        attention:
            waiting?.type === 'tool' ? (
                <AgentToolAttention
                    {...waiting.data}
                    onAccept={waiting.data.onAccept}
                    onReject={waiting.data.onReject}
                />
            ) : failedTool?.type === 'tool' ? (
                <Alert
                    className="agent-chat__tool-error"
                    variant="error"
                    text="Repository search timed out. Continuing with direct file reads using the directory listing."
                />
            ) : undefined,
    };
}

// Adapt only the demo's Agent presentation, preserving the original messages for Standard.
export function useAgentActivity(messages: TChatMessage[]) {
    const [now, setNow] = useState(performance.now());
    const active = messages.some((message) => message.metadata?.activityState === 'running');
    useEffect(() => {
        if (!active) return undefined;
        const timer = window.setInterval(() => setNow(performance.now()), 1000);
        return () => window.clearInterval(timer);
    }, [active]);
    return useMemo(() => {
        const runs: AgentChatRun[] = [];
        const finalMessages = messages.map((message) => {
            if (message.role !== 'assistant' || !Array.isArray(message.content)) return message;
            const activityParts = message.content.filter((item) => item.id !== 'demo-answer');
            if (!activityParts.length) return message;
            const metadata = message.metadata ?? {};
            const activity: ActivityPart = {
                id: `${message.id}-activity`,
                type: 'thinking',
                data: {
                    content: '',
                    status: 'thought',
                    activity: {
                        parts: activityParts,
                        startedAt: Number(metadata.activityStartedAt ?? 0),
                        finishedAt: metadata.activityFinishedAt as number | undefined,
                        pausedAt: metadata.activityPausedAt as number | undefined,
                        pausedDuration: Number(metadata.activityPausedDuration ?? 0),
                        state: (metadata.activityState as Activity['state']) ?? 'completed',
                    },
                },
            };
            runs.push({messageId: message.id!, activity: getActivity(activity, now)});
            return {
                ...message,
                content: message.content.filter((item) => item.id === 'demo-answer'),
            };
        });
        return {messages: finalMessages, runs};
    }, [messages, now]);
}

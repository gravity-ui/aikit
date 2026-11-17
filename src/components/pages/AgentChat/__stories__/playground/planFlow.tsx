import {CircleCheck, Eye, FilePlus, FileText, Pencil} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import type {TChatMessage, TToolStatus} from '../../../../../types';
import type {PlanStatus, PlanStep} from '../../../../molecules/PlanProgress';

import {FixtureCode} from './FixtureCode';

export const planPrompt = 'Build an event registration page with a schedule and a signup form.';
export const planQuestion = 'How should attendees register?';
export const planQuestionOptions = [
    {
        id: 'individual',
        title: 'One attendee per registration',
        description: 'Each person fills out their own form.',
    },
    {
        id: 'group',
        title: 'Allow group registrations',
        description: 'One person can sign up several attendees at once.',
    },
];

export const planReasoning =
    'I will prepare a plan for the event page, signup form, and validation. Once approved, I will work through the steps in order.';
export const planResponse =
    '### Event registration is ready\n\nThe event page includes the schedule and signup form. The form shows validation errors and a confirmation after submission.';

type PlanOperation = {
    id: string;
    path: string;
    action: 'Read' | 'Create' | 'Edit' | 'Verify';
} & ({output: string} | {diff: string; baselineDiff?: string; error?: string});

const page = 'src/EventPage.tsx';
const schedule = 'src/SessionSchedule.tsx';
const form = 'src/RegistrationForm.tsx';

const pageLayoutDiff = `@@ Event heading @@
-      <h1>New event</h1>
+      <h1>Design Systems Summit</h1>
+      <p>May 14 · Main Hall</p>`;
const scheduleLinkDiff = `@@ Imports @@
+import {SessionSchedule} from './SessionSchedule';
@@ Schedule section @@
-      <p>Schedule coming soon</p>
+      <SessionSchedule />`;
const formLinkDiff = `@@ Imports @@
+import {RegistrationForm} from './RegistrationForm';
@@ Registration section @@
-      <p>Registration opens soon</p>
+      <RegistrationForm />`;
const formDiff = `+export function RegistrationForm() {
+  return <form><input name="email" type="email" /><button>Register</button></form>;
+}`;
const validatedFormBody = `+  const [registered, setRegistered] = useState(false);
+  if (registered) return <p role="status">Registration confirmed</p>;
+  return <form onSubmit={(event) => { event.preventDefault(); setRegistered(true); }}>
+    <label>Email <input name="email" type="email" required /></label>
+    <button>Register</button>
+  </form>;`;

export const planTasks: Array<{
    id: string;
    title: string;
    description: string;
    durationMs: number;
    operations: PlanOperation[];
}> = [
    {
        id: 'event-page',
        title: 'Build the event page',
        description: 'Lay out the event details and the main registration action.',
        durationMs: 3600,
        operations: [
            {id: 'read-page', action: 'Read', path: page, output: '<h1>New event</h1>'},
            {id: 'edit-page', action: 'Edit', path: page, diff: pageLayoutDiff},
        ],
    },
    {
        id: 'schedule',
        title: 'Add the session schedule',
        description: 'Organize the sessions by time and make the schedule easy to scan on mobile.',
        durationMs: 4200,
        operations: [
            {
                id: 'create-schedule',
                action: 'Create',
                path: schedule,
                diff: `+export function SessionSchedule() {
+  return <ul><li>09:30 · Opening keynote</li><li>11:00 · Component workshop</li></ul>;
+}`,
            },
            {
                id: 'link-schedule',
                action: 'Edit',
                path: page,
                diff: scheduleLinkDiff,
                baselineDiff: `${pageLayoutDiff}\n${scheduleLinkDiff}`,
            },
        ],
    },
    {
        id: 'signup-form',
        title: 'Add the registration form',
        description: 'Collect the attendee email.',
        durationMs: 5000,
        operations: [
            {
                id: 'create-form',
                action: 'Create',
                path: form,
                diff: formDiff,
                error: 'The registration form could not be saved.',
            },
            {
                id: 'link-form',
                action: 'Edit',
                path: page,
                diff: formLinkDiff,
                baselineDiff: `${pageLayoutDiff}\n${scheduleLinkDiff}\n${formLinkDiff}`,
            },
        ],
    },
    {
        id: 'validation',
        title: 'Validate the form and confirm registration',
        description: 'Explain how to correct invalid fields and confirm a successful submission.',
        durationMs: 4400,
        operations: [
            {
                id: 'validate-form',
                action: 'Edit',
                path: form,
                diff: `@@ Imports @@
+import {useState} from 'react';
@@ RegistrationForm @@
-  return <form><input name="email" type="email" /><button>Register</button></form>;
${validatedFormBody}`,
                baselineDiff: `+import {useState} from 'react';
+export function RegistrationForm() {
${validatedFormBody}
+}`,
            },
        ],
    },
    {
        id: 'verify-preview',
        title: 'Verify registration in the preview',
        description: 'Check required fields, invalid email, and successful registration.',
        durationMs: 3800,
        operations: [
            {
                id: 'verify-form',
                action: 'Verify',
                path: form,
                output: 'Empty email: rejected\nInvalid email: rejected\nValid email: confirmation shown',
            },
        ],
    },
];

const operationIcons = {Read: Eye, Create: FilePlus, Edit: Pencil, Verify: CircleCheck};

function diffStat(diff: string) {
    const lines = diff.split('\n');
    return {
        added: lines.filter((line) => line.startsWith('+')).length,
        deleted: lines.filter((line) => line.startsWith('-')).length,
    };
}

export function getPlanOperationPart(
    runId: string,
    operation: PlanOperation,
    status: TToolStatus,
    error?: string,
) {
    const {id, action, path} = operation;
    const diff = 'diff' in operation ? operation.diff : undefined;
    const output = 'output' in operation ? operation.output : operation.diff;
    return {
        id: `${runId}-${id}`,
        type: 'tool' as const,
        data: {
            status,
            toolName: action,
            toolIcon: <Icon data={operationIcons[action]} size={14} />,
            footerContent: id,
            bodyContent:
                status === 'success' ? (
                    <FixtureCode diff={Boolean(diff)}>{output}</FixtureCode>
                ) : (
                    error
                ),
            demoContext: {
                action,
                target: path,
                filePath: path,
                changes: diff ? diffStat(diff) : undefined,
            },
        },
    };
}

const stepStatuses: Record<TToolStatus, PlanStep['status']> = {
    loading: 'running',
    success: 'completed',
    error: 'failed',
    cancelled: 'cancelled',
    waitingConfirmation: 'pending',
    waitingSubmission: 'pending',
};

export function getPlanSteps(statuses: readonly (TToolStatus | undefined)[] = []): PlanStep[] {
    return planTasks.map(({id, title}, index) => {
        const status = statuses[index];
        return {id, title, status: status ? stepStatuses[status] : 'pending'};
    });
}

export function getPlanReview(message: TChatMessage | undefined) {
    if (message?.role !== 'assistant' || !Array.isArray(message.content)) {
        return undefined;
    }
    const review = message.content.find(
        (part) => part.type === 'tool' && part.data.footerContent === 'review_plan',
    );
    return review?.type === 'tool' ? review : undefined;
}

export function getMessagePlan(message: TChatMessage | undefined, now?: number) {
    if (
        message?.role !== 'assistant' ||
        !Array.isArray(message.content) ||
        !message.metadata?.planProposalId
    ) {
        return undefined;
    }

    const operationStatuses = new Map(
        message.content
            .filter((part) => part.type === 'tool')
            .map(({data}) => [data.footerContent, data.status]),
    );
    const statuses = planTasks.map(({operations}) => {
        const last = operations[operations.length - 1];
        const lastStatus = operationStatuses.get(last.id);
        const started = operations.some(({id}) => operationStatuses.has(id));
        const interrupted = operations
            .map(({id}) => operationStatuses.get(id))
            .find((status) => status === 'error' || status === 'cancelled');
        return interrupted ?? lastStatus ?? (started ? 'loading' : undefined);
    });
    const elapsed = message.metadata?.planStepElapsedMs;
    const planSteps = getPlanSteps(statuses).map((step, index) => {
        let duration = Array.isArray(elapsed) ? elapsed[index] : undefined;
        const {planStepStartedAt, activityPausedAt, activityPausedDuration, activityFinishedAt} =
            message.metadata ?? {};
        if (
            (step.status === 'running' || step.status === 'cancelled') &&
            typeof planStepStartedAt === 'number'
        ) {
            const end = activityFinishedAt ?? activityPausedAt ?? now;
            if (typeof end === 'number') {
                duration = Math.max(
                    0,
                    end - Number(activityPausedDuration ?? 0) - planStepStartedAt,
                );
            }
        }
        if (typeof duration !== 'number') {
            return step;
        }
        const seconds = Math.floor(duration / 1000);
        const elapsedLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        return {...step, elapsedLabel};
    });
    let status: PlanStatus = operationStatuses.size ? 'running' : 'pending';
    switch (message.metadata?.responseState) {
        case 'error':
            status = 'failed';
            break;
        case 'cancelled':
            status = 'cancelled';
            break;
        case 'completed':
            status = 'completed';
            break;
    }
    const changes = new Map<string, string>();
    for (const {operations} of planTasks) {
        for (const operation of operations) {
            if ('diff' in operation && operationStatuses.get(operation.id) === 'success') {
                changes.set(operation.path, operation.baselineDiff ?? operation.diff);
            }
        }
    }
    const files = Array.from(changes, ([path, diff]) => ({
        id: path,
        path,
        diff,
        ...diffStat(diff),
    }));
    return {id: message.id, steps: planSteps, status, files};
}

export function getLatestPlan(messages: TChatMessage[], now: number) {
    return getMessagePlan(
        [...messages]
            .reverse()
            .find(({role, content}) => role === 'assistant' && Array.isArray(content)),
        now,
    );
}

export const planTools = [
    {
        name: 'Project brief and plan are ready',
        tool: 'review_plan',
        icon: FileText,
        target: `${planTasks.length} steps`,
        summary: 'Plan approved',
        body: undefined,
        compactContext: {pending: `${planTasks.length} steps`, completed: 'Plan approved'},
        confirmation: true,
    },
];

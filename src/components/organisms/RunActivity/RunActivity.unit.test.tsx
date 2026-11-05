import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';

import {RunActivity, type RunActivityStep} from '.';

jest.mock('../ThinkingMessage', () => ({ThinkingMessage: () => null}));
jest.mock('../ToolMessage', () => ({ToolMessage: () => null}));

it('preserves disclosure across lifecycle changes and uses recorded duration on remount', () => {
    const props = {id: 'run', steps: [], durationMs: 12000} as const;
    const {rerender, unmount} = render(<RunActivity {...props} state="running" />);
    fireEvent.click(screen.getByRole('button', {name: 'Thinking'}));
    rerender(<RunActivity {...props} state="completed" />);
    expect(screen.getByRole('button', {name: 'Worked for 12 s'})).toHaveAttribute(
        'aria-expanded',
        'true',
    );
    unmount();
    render(<RunActivity {...props} state="completed" />);
    expect(screen.getByRole('button', {name: 'Worked for 12 s'})).toHaveAttribute(
        'aria-expanded',
        'false',
    );
});

it('keeps attention visible while history is folded and retains original step objects', () => {
    const accept = jest.fn();
    const steps: RunActivityStep[] = [
        {
            id: 'call',
            kind: 'tool',
            toolCallId: 'tool-call',
            input: {path: 'src/a.ts'},
            output: {ok: true},
            props: {toolName: 'Read', onAccept: accept},
        },
    ];
    const renderStep = jest.fn((step) => <span>{step.id}</span>);
    render(
        <RunActivity
            id="run"
            state="needs-input"
            durationMs={4000}
            steps={steps}
            renderStep={renderStep}
            attention={<button onClick={accept}>Approve</button>}
        />,
    );
    expect(screen.getByRole('button', {name: 'Approve'})).toBeVisible();
    expect(renderStep).toHaveBeenCalledWith(steps[0]);
    fireEvent.click(screen.getByRole('button', {name: 'Approve'}));
    expect(accept).toHaveBeenCalledTimes(1);
});

it.each([
    ['cancelled', 'Stopped after 2 s'],
    ['error', 'Work interrupted · 2 s'],
    ['paused', 'Paused · 2 s'],
] as const)('preserves the %s state', (state, label) => {
    render(<RunActivity id="run" steps={[]} state={state} durationMs={2000} />);
    expect(screen.getByRole('button', {name: label})).toBeVisible();
});

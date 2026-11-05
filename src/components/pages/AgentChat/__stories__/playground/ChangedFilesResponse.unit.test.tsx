import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';

import type {TAssistantMessage} from '../../../../../types';

import {ChangedFilesResponse} from './ChangedFilesResponse';

const originalMatchMedia = window.matchMedia;
beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
        matches: false,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }));
});
afterAll(() => {
    window.matchMedia = originalMatchMedia;
});

function message(responseState: string): TAssistantMessage {
    return {
        id: 'run',
        role: 'assistant',
        metadata: {responseState, activityState: 'completed'},
        content: [{id: 'run-tool-5', type: 'tool', data: {toolName: 'Create', status: 'success'}}],
    };
}
it('does not show a card just because activity has completed', () => {
    const {container} = render(
        <ChangedFilesResponse
            message={message('running')}
            onUndo={() => {}}
            onRestore={() => {}}
        />,
    );
    expect(container).toBeEmptyDOMElement();
});
it.each([
    ['cancelled', 'before cancellation'],
    ['error', 'before interruption'],
])('labels actual partial changes neutrally after %s', (state, label) => {
    render(
        <ChangedFilesResponse message={message(state)} onUndo={() => {}} onRestore={() => {}} />,
    );
    expect(screen.getByRole('button', {name: new RegExp(`1 file changed ${label}`)})).toBeVisible();
    expect(screen.queryByText(/successfully/i)).toBeNull();
});
it('offers restore only for an undone fixture response', () => {
    const original = message('completed');
    original.metadata = {...original.metadata, changesUndone: true};
    const restore = jest.fn();
    render(<ChangedFilesResponse message={original} onUndo={() => {}} onRestore={restore} />);
    expect(screen.getByRole('status')).toHaveTextContent('Simulated changes reverted');
    fireEvent.click(screen.getByRole('button', {name: 'Restore fixture changes'}));
    expect(restore).toHaveBeenCalledTimes(1);
});

import '@testing-library/jest-dom';
import {fireEvent, render, screen} from '@testing-library/react';

import {ChangedFilesSummary} from '.';

const files = [{id: 'file', path: 'src/App.tsx', added: 6, deleted: 0}];
it('keeps pill as the default without inventing card actions', () => {
    const {container} = render(<ChangedFilesSummary files={files} />);
    expect(container.querySelector('.g-aikit-changed-files-summary_view_pill')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Undo'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'View changes'})).toBeNull();
});
it('only exposes card actions backed by callbacks', () => {
    const undo = jest.fn();
    const preview = jest.fn();
    const {rerender} = render(
        <ChangedFilesSummary view="card" files={files} onUndo={undo} onViewChanges={preview} />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Undo'}));
    fireEvent.click(screen.getByRole('button', {name: 'View changes'}));
    expect(undo).toHaveBeenCalledTimes(1);
    expect(preview).toHaveBeenCalledTimes(1);
    rerender(<ChangedFilesSummary view="card" files={files} />);
    expect(screen.queryByRole('button', {name: 'Undo'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'View changes'})).toBeNull();
});
it('disables both card actions when disabled', () => {
    const action = jest.fn();
    render(
        <ChangedFilesSummary
            view="card"
            files={files}
            disabled
            onUndo={action}
            onViewChanges={action}
        />,
    );
    fireEvent.click(screen.getByRole('button', {name: 'Undo'}));
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'View changes'})).toBeDisabled();
});

import {developerChanges} from './changedFilesFixture';
import {developerSteps} from './developerFlow';

it('keeps baseline statistics consistent with the four displayed file changes', () => {
    for (const [index, stepIndex] of [5, 6, 7, 8].entries()) {
        const step = developerSteps[stepIndex];
        const source = step.body.props.children as string;
        const lines = source.split('\n');
        const added =
            step.tool === 'add_entry'
                ? lines.length
                : lines.filter((line) => line.startsWith('+')).length;
        const deleted =
            step.tool === 'add_entry' ? 0 : lines.filter((line) => line.startsWith('-')).length;
        expect({added, deleted}).toEqual({
            added: developerChanges.files[index].added,
            deleted: developerChanges.files[index].deleted,
        });
    }
    expect(developerChanges.files.reduce((sum, file) => sum + file.added, 0)).toBe(
        developerChanges.added,
    );
    expect(developerChanges.files.reduce((sum, file) => sum + file.deleted, 0)).toBe(
        developerChanges.deleted,
    );
});

it('uses the existing repository tool vocabulary and source review instead of a fabricated test runner', () => {
    expect(developerSteps).toHaveLength(12);
    expect(developerSteps[9].tool).toBe('read_file');
    expect(developerSteps[9].summary).toContain('no runner executed');
    expect(developerSteps[10].tool).toBe('commit_changes');
    expect(developerSteps[11].tool).toBe('create_pull_request');
});

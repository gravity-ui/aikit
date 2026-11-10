import * as activity from '..';
import * as root from '../../../../index';
import * as legacy from '../../ThinkingMessageGroup';

jest.mock('../../../atoms/MarkdownRenderer', () => ({MarkdownRenderer: () => null}));
jest.mock('uuid', () => ({v4: () => 'test-id'}));

test('root and component entry points preserve the deprecated alias and migration helpers', () => {
    expect(root.ActivityList).toBe(activity.ActivityList);
    expect(root.ThinkingMessageGroup).toBe(activity.ActivityList);
    expect(legacy.ThinkingMessageGroup).toBe(activity.ActivityList);
    expect(legacy.thinkingMessageToStep).toBe(activity.thinkingMessageToStep);
    expect(legacy.groupThinkingMessages).toBe(activity.groupThinkingMessages);
});

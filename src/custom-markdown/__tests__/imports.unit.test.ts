import * as customMarkdown from '../index';

jest.mock('../../components/atoms/MarkdownRenderer/MarkdownRenderer', () => {
    throw new Error('The custom-markdown entry must not import the built-in Markdown renderer.');
});

jest.mock('uuid', () => ({v4: () => 'test-id'}));

test('exports chat components without loading the built-in Markdown engine', () => {
    expect(customMarkdown.ChatContainer).toBeDefined();
    expect(customMarkdown.AIStudioChat).toBeDefined();
    expect(customMarkdown.AssistantMessage).toBeDefined();
    expect(customMarkdown.MarkdownProvider).toBeDefined();
    expect(customMarkdown.ActivityList).toBeDefined();
    expect(customMarkdown.ThinkingMessageGroup).toBe(customMarkdown.ActivityList);
});

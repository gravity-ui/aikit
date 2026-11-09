import {marked} from 'marked';

import type {TChatMessage} from '../types/messages';

import {downloadChatMarkdown, getMessageMarkdown, serializeChatMarkdown} from './chatMarkdown';

describe('chat Markdown export', () => {
    it('preserves source Markdown and chronological order across the entire history', () => {
        const text =
            '# Кириллица & <text>\n\n- one\n- two\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```ts\nconst x = `hello`;\n```\n\n[link](https://example.com)';
        const messages: TChatMessage[] = Array.from({length: 1000}, (_, index) => ({
            role: index % 2 ? 'assistant' : 'user',
            content: `${index}\n${text}`,
            format: 'markdown',
        }));
        const result = serializeChatMarkdown(messages, {
            roleLabels: {user: 'Пользователь', assistant: 'Ассистент'},
        });
        expect(
            result.startsWith(`## Пользователь\n\n0\n${text}\n\n## Ассистент\n\n1\n${text}`),
        ).toBe(true);
        expect(result.endsWith(`## Ассистент\n\n999\n${text}`)).toBe(true);
        expect(result.match(/## (Пользователь|Ассистент)/g)).toHaveLength(1000);
    });

    it('excludes system messages, reasoning, tool payloads, metadata and unknown cards', () => {
        const messages = [
            {role: 'system', content: 'secret'},
            {
                role: 'assistant',
                metadata: {secret: true},
                content: [
                    {type: 'text', data: {text: 'public'}},
                    {type: 'thinking', data: {content: 'secret'}},
                    {type: 'tool', data: {mcpResponse: 'secret'}},
                    {type: 'card', data: {secret: true}},
                ],
            },
        ] as unknown as TChatMessage[];
        expect(serializeChatMarkdown(messages)).toBe('## Assistant\n\npublic');
    });

    it('uses only explicitly supplied public text for custom cards', () => {
        const getContentMarkdown = jest.fn(() => 'Result: [server](https://example.com)');
        const message = {
            role: 'assistant',
            content: [
                {type: 'tool', data: {secret: true}},
                {type: 'card', data: {secret: true}},
            ],
        } as unknown as TChatMessage;
        expect(getMessageMarkdown(message, {getContentMarkdown})).toBe(
            'Result: [server](https://example.com)',
        );
        expect(getContentMarkdown).toHaveBeenCalledTimes(1);
    });

    it('includes attachment names and portable image links without private IDs or inline data', () => {
        const result = getMessageMarkdown({
            role: 'user',
            content: '',
            fileAttachments: [{id: 'private-id', name: '[report].txt'}],
            images: ['data:image/png;base64,secret', 'https://example.com/a b.png'],
        });
        expect(result).toBe('\\[report\\]\\.txt\n\n<https://example.com/a%20b.png>');
    });

    it('skips empty messages and supports selected subsets without reordering', () => {
        expect(
            serializeChatMarkdown([
                {role: 'user', content: ' '},
                {role: 'assistant', content: []},
            ]),
        ).toBe('');
        expect(serializeChatMarkdown([{role: 'assistant', content: 'selected'}])).toBe(
            '## Assistant\n\nselected',
        );
    });

    it('downloads UTF-8 Markdown and releases the temporary URL', () => {
        jest.useFakeTimers();
        const create = jest.fn((_blob: Blob) => 'blob:chat');
        const revoke = jest.fn();
        Object.defineProperties(URL, {
            createObjectURL: {configurable: true, value: create},
            revokeObjectURL: {configurable: true, value: revoke},
        });
        const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement,
        ) {
            expect(this.download).toBe('chat.md');
            expect(this.href).toBe('blob:chat');
        });
        downloadChatMarkdown('## Пользователь\n\nПривет');
        expect(create.mock.calls[0][0]).toBeInstanceOf(Blob);
        expect(document.querySelector('a')).toBeNull();
        jest.runAllTimers();
        expect(revoke).toHaveBeenCalledWith('blob:chat');
        click.mockRestore();
        jest.useRealTimers();
    });
});

it('escapes plain user text while preserving explicitly requested Markdown', () => {
    const content = '```\n**bold** &copy; <em>hello</em>\n# heading';
    const output = serializeChatMarkdown([
        {role: 'user', content},
        {role: 'user', content: '**markdown**', format: 'markdown'},
        {role: 'assistant', content: 'answer'},
    ]);
    const html = marked.parse(output) as string;
    expect(html).not.toContain('<pre>');
    expect(html).not.toContain('<em>');
    expect(html).toContain('<strong>markdown</strong>');
    expect(html).toContain('&amp;copy;');
    expect(html).toContain('<h2>Assistant</h2>');
});

it.each(['```js\nconst x = 1;', '~~~~text\n```\ntext', '```'])(
    'isolates an unfinished fence: %s',
    (content) => {
        const html = marked.parse(
            serializeChatMarkdown([
                {role: 'assistant', content},
                {role: 'assistant', content: 'next answer'},
            ]),
        ) as string;
        expect(html.match(/<h2>Assistant<\/h2>/g)).toHaveLength(2);
        expect(html).toContain('<p>next answer</p>');
    },
);

it('resolves full, collapsed, shortcut and image references within each message', () => {
    const messages = ['first', 'second'].map((name) => ({
        role: 'assistant' as const,
        content: `[link][ref] [ref][] [ref] ![image][ref]\n\n[ref]: https://${name}.example "${name}"`,
    }));
    const html = marked.parse(serializeChatMarkdown(messages)) as string;
    for (const name of ['first', 'second']) {
        expect(html.match(new RegExp(`href="https://${name}.example"`, 'g'))).toHaveLength(3);
        expect(html).toContain(`src="https://${name}.example"`);
    }
});

it('preserves reference destinations in lists, quotes and tables without rewriting code', () => {
    const content =
        '> [link][ref]\n\n- [link][ref]\n\n| Link |\n| --- |\n| [link][ref] |\n\n`[link][ref]`\n\n```\n[link][ref]\n```\n\n[ref]: https://first.example';
    const output = serializeChatMarkdown([
        {role: 'assistant', content},
        {role: 'assistant', content: '[link][ref]\n\n[ref]: https://second.example'},
    ]);
    const html = marked.parse(output) as string;
    expect(html.match(/href="https:\/\/first.example"/g)).toHaveLength(3);
    expect(html).toContain('href="https://second.example"');
    expect(output).toContain('`[link][ref]`');
    expect(output).toContain('```\n[link][ref]\n```');
});

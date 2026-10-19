/** @jest-environment node */
import transform from '@diplodoc/transform';

import {MARKDOWN_MERMAID_CLASS} from '../markdownMermaidPlugin';
import {mergeMarkdownTransformOptions} from '../markdownUtils';

const renderMarkdown = (content: string, enabled = true) =>
    transform(content, mergeMarkdownTransformOptions(undefined, enabled)).result.html;

describe('Mermaid markdown transformation', () => {
    test('keeps Mermaid fences as ordinary code unless explicitly enabled', () => {
        const content = '```mermaid\ngraph TD; A-->B\n```';
        const html = transform(content, mergeMarkdownTransformOptions()).result.html;
        expect(html).not.toContain(MARKDOWN_MERMAID_CLASS);
        expect(html).toContain('<pre');
        expect(renderMarkdown(content, false)).toBe(html);
        expect(renderMarkdown(content)).toContain(MARKDOWN_MERMAID_CLASS);
    });

    test('marks Mermaid fences and preserves surrounding markdown and ordinary code', () => {
        const html = renderMarkdown(
            'Before **diagram**\n\n```mermaid\ngraph TD; A-->B\n```\n\n```js\nconst n = 1;\n```\n\nAfter',
        );
        expect(html.split(`class="${MARKDOWN_MERMAID_CLASS}"`)).toHaveLength(2);
        expect(html).toContain('<code class="language-mermaid">graph TD; A--&gt;B\n</code>');
        expect(html).toContain('<strong>diagram</strong>');
        expect(html).toContain('const');
        expect(html).toContain('<p>After</p>');
    });

    test('keeps incomplete input readable and escapes HTML in source', () => {
        const html = renderMarkdown('~~~mermaid\ngraph TD\nA[<img src=x onerror=alert(1)>');
        expect(html).toContain(`class="${MARKDOWN_MERMAID_CLASS}"`);
        expect(html).toContain('A[&lt;img src=x onerror=alert(1)&gt;</code>');
        expect(html).not.toContain('<img');
    });
});

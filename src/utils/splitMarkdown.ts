import {Code} from 'mdast';
import remarkParse from 'remark-parse';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';

export type MarkdownBlock =
    | {type: 'text'; content: string}
    | {type: 'code'; language: string; content: string};

const markdownParser = unified().use(remarkParse);

function visitCodeBlocks(md: string, visitor: (node: Code) => void): void {
    const tree = markdownParser.parse(md);

    visit(tree, 'code', visitor);
}

export function splitMarkdown(md: string): MarkdownBlock[] {
    const result: MarkdownBlock[] = [];

    let lastIndex = 0;

    visitCodeBlocks(md, (node) => {
        const start = node.position?.start.offset;
        const end = node.position?.end.offset;

        if (start === undefined || end === undefined) {
            return;
        }

        if (start > lastIndex) {
            result.push({
                type: 'text',
                content: md.slice(lastIndex, start),
            });
        }

        result.push({
            type: 'code',
            language: node.lang || '',
            content: '```' + node.lang + '\n' + (node.value ?? '') + '\n```',
        });

        lastIndex = end;
    });

    if (lastIndex < md.length) {
        result.push({
            type: 'text',
            content: md.slice(lastIndex),
        });
    }

    return result;
}

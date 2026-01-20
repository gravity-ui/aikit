import {Lexer} from 'marked';

const footnoteReferencePattern = /\[\^[^\]\s]{1,200}\](?!:)/;
const footnoteDefinitionPattern = /\[\^[^\]\s]{1,200}\]:/;
const closingTagPattern = /<\/(\w+)>/;
const openingTagPattern = /<(\w+)[\s>]/;

const handleHtmlBlock = (
    token: {type: string; raw: string; block?: boolean},
    htmlStack: string[],
    lastBlock: string,
): {merged: string; shouldPopStack: boolean} | null => {
    if (htmlStack.length === 0) {
        return null;
    }

    const merged = lastBlock + token.raw;
    let shouldPopStack = false;

    if (token.type === 'html') {
        const closingTagMatch = token.raw.match(closingTagPattern);
        if (closingTagMatch) {
            const closingTag = closingTagMatch[1];
            if (htmlStack[htmlStack.length - 1] === closingTag) {
                shouldPopStack = true;
            }
        }
    }
    return {merged, shouldPopStack};
};

const processOpeningHtmlTag = (
    token: {type: string; raw: string; block?: boolean},
    htmlStack: string[],
): void => {
    if (token.type !== 'html' || !token.block) {
        return;
    }

    const openingTagMatch = token.raw.match(openingTagPattern);
    if (openingTagMatch) {
        const tagName = openingTagMatch[1];
        const hasClosingTag = token.raw.includes(`</${tagName}>`);
        if (!hasClosingTag) {
            htmlStack.push(tagName);
        }
    }
};

export const parseMarkdownIntoBlocks = (markdown: string): string[] => {
    const hasFootnoteReference = footnoteReferencePattern.test(markdown);
    const hasFootnoteDefinition = footnoteDefinitionPattern.test(markdown);

    if (hasFootnoteReference || hasFootnoteDefinition) {
        return [markdown];
    }

    const tokens = Lexer.lex(markdown, {gfm: true});
    const mergedBlocks: string[] = [];
    const htmlStack: string[] = [];

    for (const token of tokens) {
        const currentBlock = token.raw;

        if (mergedBlocks.length > 0) {
            const lastBlock = mergedBlocks[mergedBlocks.length - 1];
            const htmlResult = handleHtmlBlock(token, htmlStack, lastBlock);
            if (htmlResult) {
                mergedBlocks[mergedBlocks.length - 1] = htmlResult.merged;
                if (htmlResult.shouldPopStack) {
                    htmlStack.pop();
                }
                continue;
            }
        }

        processOpeningHtmlTag(token, htmlStack);

        mergedBlocks.push(currentBlock);
    }

    return mergedBlocks;
};

import type {ExtendedPluginWithCollect, MarkdownIt} from '@diplodoc/transform/lib/typings';

export const MARKDOWN_CODE_BLOCKS_ENV_KEY = '__aikitMarkdownCodeBlocks';

const CODE_BLOCK_CONTAINER_CLASSES = ['yfm-code-floating-container', 'yfm-clipboard'] as const;

export interface MarkdownCodeBlockArtifact {
    code: string;
    language?: string;
}

interface MarkdownCodeBlockEnvironment {
    [MARKDOWN_CODE_BLOCKS_ENV_KEY]?: MarkdownCodeBlockArtifact[];
}

const getLanguage = (info: string) => {
    const language = info.trim().split(/\s+/, 1)[0];

    return language ? language.toLowerCase() : undefined;
};

const removeParserTrailingLineFeed = (code: string) =>
    code.endsWith('\n') ? code.slice(0, -1) : code;

const findCodeBlockContainer = (rendered: string) => {
    for (const className of CODE_BLOCK_CONTAINER_CLASSES) {
        const containerPattern = new RegExp(
            `<div(?=[^>]*\\bclass="[^"]*\\b${className}\\b[^"]*")[^>]*>`,
        );
        const match = rendered.match(containerPattern)?.[0];
        if (match) {
            return match;
        }
    }

    return undefined;
};

export const markdownCodeBlockPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    const defaultRender = md.renderer.rules.fence;

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const rendered = defaultRender?.(tokens, idx, options, env, self) ?? '';
        const codeBlockContainer = findCodeBlockContainer(rendered);
        if (!codeBlockContainer) {
            return rendered;
        }

        const token = tokens[idx];
        const codeBlockEnvironment = env as MarkdownCodeBlockEnvironment;
        const language = getLanguage(token.info);
        (codeBlockEnvironment[MARKDOWN_CODE_BLOCKS_ENV_KEY] ??= []).push({
            code: removeParserTrailingLineFeed(token.content),
            ...(language ? {language} : {}),
        });

        return rendered.replace(
            codeBlockContainer,
            codeBlockContainer.replace('>', ' data-aikit-code-block>'),
        );
    };
}) as ExtendedPluginWithCollect;

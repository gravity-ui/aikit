import type {ExtendedPluginWithCollect, MarkdownIt} from '@diplodoc/transform/lib/typings';

import {NAMESPACE} from './cn';

export const MARKDOWN_MERMAID_CLASS = `${NAMESPACE}markdown-renderer__mermaid`;

/** Keep the source readable until the browser successfully renders the diagram. */
export const markdownMermaidPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    const defaultFence =
        md.renderer.rules.fence ||
        ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules.fence = (tokens, index, options, env, self) => {
        const token = tokens[index];
        if (token.info.trim().split(/\s+/)[0] !== 'mermaid') {
            return defaultFence(tokens, index, options, env, self);
        }

        return `<div class="${MARKDOWN_MERMAID_CLASS}"><pre><code class="language-mermaid">${md.utils.escapeHtml(token.content)}</code></pre></div>`;
    };
}) as ExtendedPluginWithCollect;

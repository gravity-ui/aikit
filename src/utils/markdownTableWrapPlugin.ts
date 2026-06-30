import type {ExtendedPluginWithCollect, MarkdownIt} from '@diplodoc/transform/lib/typings';

import {NAMESPACE} from './cn';

/** Matches `.g-aikit-markdown-renderer__table-wrap` in MarkdownRenderer.scss */
export const MARKDOWN_TABLE_WRAP_CLASS = `${NAMESPACE}markdown-renderer__table-wrap`;

export const markdownTableWrapPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    const defaultTableOpen =
        md.renderer.rules.table_open ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    const defaultTableClose =
        md.renderer.rules.table_close ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
        return `<div class="${MARKDOWN_TABLE_WRAP_CLASS}">${defaultTableOpen(tokens, idx, options, env, self)}`;
    };

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
        return `${defaultTableClose(tokens, idx, options, env, self)}</div>`;
    };
}) as ExtendedPluginWithCollect;

import type {ExtendedPluginWithCollect, MarkdownIt} from '@diplodoc/transform/lib/typings';

import {NAMESPACE} from './cn';

/** Matches `.g-aikit-markdown-renderer__table-wrap` in MarkdownRenderer.scss */
export const MARKDOWN_TABLE_WRAP_CLASS = `${NAMESPACE}markdown-renderer__table-wrap`;

type TableOpenRule = 'table_open' | 'yfm_table_open';
type TableCloseRule = 'table_close' | 'yfm_table_close';

function wrapTableRendererRules(
    md: MarkdownIt,
    openRule: TableOpenRule,
    closeRule: TableCloseRule,
): void {
    const defaultTableOpen =
        md.renderer.rules[openRule] ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    const defaultTableClose =
        md.renderer.rules[closeRule] ||
        function (tokens, idx, options, _env, self) {
            return self.renderToken(tokens, idx, options);
        };

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules[openRule] = function (tokens, idx, options, env, self) {
        return `<div class="${MARKDOWN_TABLE_WRAP_CLASS}">${defaultTableOpen(tokens, idx, options, env, self)}`;
    };

    // eslint-disable-next-line no-param-reassign
    md.renderer.rules[closeRule] = function (tokens, idx, options, env, self) {
        return `${defaultTableClose(tokens, idx, options, env, self)}</div>`;
    };
}

export const markdownTableWrapPlugin: ExtendedPluginWithCollect = ((md: MarkdownIt) => {
    wrapTableRendererRules(md, 'table_open', 'table_close');
    wrapTableRendererRules(md, 'yfm_table_open', 'yfm_table_close');
}) as ExtendedPluginWithCollect;

import type {ToolMessageContent} from '../../../types/messages';
import {block} from '../../../utils/cn';
import {MarkdownRenderer} from '../../atoms/MarkdownRenderer';
import {ToolMessage} from '../../organisms/ToolMessage';

import {i18n} from './i18n';

import './McpToolRenderer.scss';

const b = block('aistudio-mcp-tool');

export function McpToolRenderer({part}: {part: ToolMessageContent}) {
    const {mcpRequest, mcpResponse, ...rest} = part.data;
    const hasMcp = Boolean(mcpRequest || mcpResponse);

    if (!hasMcp) {
        return <ToolMessage {...rest} />;
    }

    const body = (
        <div className={b()}>
            {mcpRequest && (
                <div className={b('section')}>
                    <div className={b('section-label')}>{i18n('mcp_request')}</div>
                    <MarkdownRenderer content={`\`\`\`json\n${mcpRequest}\n\`\`\``} />
                </div>
            )}
            {mcpResponse && (
                <div className={b('section')}>
                    <div className={b('section-label')}>{i18n('mcp_response')}</div>
                    <MarkdownRenderer content={`\`\`\`json\n${mcpResponse}\n\`\`\``} />
                </div>
            )}
        </div>
    );

    return <ToolMessage {...rest} bodyContent={body} />;
}

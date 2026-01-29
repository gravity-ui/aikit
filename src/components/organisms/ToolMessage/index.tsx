import {Card} from '@gravity-ui/uikit';

import {useToolMessage} from '../../../hooks/useToolMessage';
import type {ToolMessageProps} from '../../../types/tool';
import {block} from '../../../utils/cn';
import {ToolFooter, ToolHeader} from '../../molecules';

import './ToolMessage.scss';

const b = block('tool-message');

export function ToolMessage(props: ToolMessageProps) {
    const {toolName, className, qa, bodyContent, status, toolIcon, headerContent} = props;

    const {isExpanded, headerActions, footerActions, footerContent, showLoader, isWaiting} =
        useToolMessage(props);

    return (
        <Card className={b({waiting: isWaiting}, className)} qa={qa}>
            <div className={b('container')}>
                <ToolHeader
                    toolName={toolName}
                    actions={headerActions}
                    toolIcon={toolIcon}
                    content={headerContent}
                    status={status}
                />
                {bodyContent && isExpanded && <div className={b('content')}>{bodyContent}</div>}
                {isWaiting && (
                    <ToolFooter
                        actions={footerActions}
                        content={footerContent}
                        showLoader={showLoader}
                    />
                )}
            </div>
        </Card>
    );
}

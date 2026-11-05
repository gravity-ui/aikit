import {Card} from '@gravity-ui/uikit';

import {useToolMessage} from '../../../hooks/useToolMessage';
import type {ToolMessageProps} from '../../../types/tool';
import {block} from '../../../utils/cn';
import {ToolFooter} from '../../molecules/ToolFooter';
import {ToolHeader} from '../../molecules/ToolHeader';
import {CompactRow} from '../RunActivity/CompactRow';

import './ToolMessage.scss';

const b = block('tool-message');

export function ToolMessage(props: ToolMessageProps) {
    const {toolName, className, qa, bodyContent, status, toolIcon, headerContent} = props;

    const {
        isExpanded,
        toggleExpanded,
        headerActions,
        footerActions,
        footerContent,
        showLoader,
        isWaiting,
    } = useToolMessage(props);

    if (props.view === 'compact') {
        return (
            <div className={className} data-qa={qa}>
                <CompactRow
                    label={
                        <>
                            {toolName}
                            {status === 'error' && (
                                <span style={{color: 'var(--g-color-text-danger)'}}> · Failed</span>
                            )}
                            {status === 'cancelled' && <span> · Cancelled</span>}
                        </>
                    }
                    icon={toolIcon}
                    context={props.secondaryText}
                    tooltip={props.contextTooltip}
                    active={status === 'loading'}
                    expanded={isExpanded}
                    onToggle={toggleExpanded}
                >
                    {headerContent}
                    {bodyContent}
                </CompactRow>
                {props.headerActions && (
                    <ToolFooter actions={props.headerActions} showLoader={false} />
                )}
                {isWaiting && props.attentionPlacement !== 'external' && (
                    <ToolFooter
                        actionSize={props.footerActionSize}
                        actions={footerActions}
                        content={footerContent}
                        showLoader={showLoader}
                    />
                )}
            </div>
        );
    }

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
                        actionSize={props.footerActionSize}
                        actions={footerActions}
                        content={footerContent}
                        showLoader={showLoader}
                    />
                )}
            </div>
        </Card>
    );
}

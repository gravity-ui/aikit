import React, {type HTMLAttributes} from 'react';

import type {OptionsType} from '@diplodoc/transform/lib/typings';
import {Avatar, useMobile} from '@gravity-ui/uikit';

import type {BaseMessageProps, FileAttachment} from '../../../types/messages';
import {block, modsClassName} from '../../../utils/cn';
import {FileIcon} from '../../atoms/FileIcon';
import {
    type MarkdownCodeBlockActionsConfig,
    MarkdownRenderer,
    type MarkdownRendererMdxOptions,
} from '../../atoms/MarkdownRenderer';
import {MessageBalloon} from '../../atoms/MessageBalloon';
import {BaseMessage} from '../../molecules/BaseMessage';

import './UserMessage.scss';

const b = block('user-message');

export type UserMessageProps = Pick<
    BaseMessageProps,
    'actions' | 'extraInfo' | 'showActionsOnHover' | 'showTimestamp' | 'timestamp' | 'onActionPopup'
> & {
    content: React.ReactNode;
    format?: 'plain' | 'markdown';
    showAvatar?: boolean;
    avatarUrl?: string;
    /** Base64 data URLs or regular image URLs to display above the text balloon */
    images?: string[];
    /** File attachments to display as chips below the text balloon */
    fileAttachments?: FileAttachment[];
    transformOptions?: OptionsType;
    shouldParseIncompleteMarkdown?: boolean;
    openMarkdownLinksInNewTab?: boolean;
    mdxOptions?: MarkdownRendererMdxOptions;
    mdxContext?: Record<string, unknown>;
    codeBlockActions?: MarkdownCodeBlockActionsConfig;
    /** Extra props forwarded to the root container `div` of the rendered markdown block. */
    markdownExtraProps?: HTMLAttributes<HTMLDivElement>;
    className?: string;
    qa?: string;
};

export const UserMessage = (props: UserMessageProps) => {
    const isMobile = useMobile();
    const {
        className,
        qa,
        content,
        actions,
        extraInfo,
        showActionsOnHover,
        showAvatar,
        avatarUrl = '',
        images,
        fileAttachments,
        timestamp = '',
        showTimestamp,
        format = 'plain',
        transformOptions,
        shouldParseIncompleteMarkdown,
        openMarkdownLinksInNewTab,
        mdxOptions,
        mdxContext,
        codeBlockActions,
        markdownExtraProps,
        onActionPopup,
    } = props;

    return (
        <div className={b(null, className)} data-qa={qa}>
            {showAvatar ? <Avatar imgUrl={avatarUrl} size="s" view="filled" /> : null}
            <BaseMessage
                role="user"
                actions={actions}
                extraInfo={extraInfo}
                showActionsOnHover={showActionsOnHover}
                showTimestamp={showTimestamp}
                timestamp={timestamp}
                onActionPopup={onActionPopup}
            >
                {images?.map((src, i) => (
                    <MessageBalloon key={i} className={b('image-balloon')}>
                        <img src={src} alt="" className={b('image')} />
                    </MessageBalloon>
                ))}
                <MessageBalloon className={modsClassName(b({format}))}>
                    {format === 'markdown' ? (
                        <MarkdownRenderer
                            content={content as string}
                            transformOptions={transformOptions}
                            shouldParseIncompleteMarkdown={shouldParseIncompleteMarkdown}
                            openLinksInNewTab={openMarkdownLinksInNewTab}
                            mdxOptions={mdxOptions}
                            mdxContext={mdxContext}
                            codeBlockActions={codeBlockActions}
                            extraProps={markdownExtraProps}
                        />
                    ) : (
                        content
                    )}
                </MessageBalloon>
                {fileAttachments && fileAttachments.length > 0 && (
                    <div className={b('file-attachments')}>
                        {fileAttachments.map((attachment) => (
                            <div key={attachment.id} className={b('file-chip')}>
                                <FileIcon
                                    mimeType={attachment.mimeType}
                                    fileName={attachment.name}
                                    size="s"
                                />
                                <span className={b('file-chip-name', {mobile: isMobile})}>
                                    {attachment.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </BaseMessage>
        </div>
    );
};

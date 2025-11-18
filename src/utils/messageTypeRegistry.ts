import type React from 'react';

import type {TMessageContent} from '../types/messages';

export type MessageContentComponentProps<TContent extends TMessageContent = TMessageContent> = {
    part: TContent;
};

export type MessageRenderer<TContent extends TMessageContent = TMessageContent> = {
    component: React.ComponentType<MessageContentComponentProps<TContent>>;
};

export type MessageRendererRegistry = Record<string, MessageRenderer>;

export function createMessageRendererRegistry(): MessageRendererRegistry {
    return {};
}

export function registerMessageRenderer<TContent extends TMessageContent>(
    registry: MessageRendererRegistry,
    contentType: TContent['type'],
    renderer: MessageRenderer<TContent>,
): MessageRendererRegistry {
    Object.assign(registry, {
        [contentType]: renderer as unknown as MessageRenderer,
    });
    return registry;
}

export function getMessageRenderer(
    registry: MessageRendererRegistry,
    contentType: string,
): React.ComponentType<MessageContentComponentProps> | undefined {
    return registry[contentType]?.component;
}

export function mergeMessageRendererRegistries(
    defaultRegistry: MessageRendererRegistry,
    customRegistry: MessageRendererRegistry,
): MessageRendererRegistry {
    return {
        ...defaultRegistry,
        ...customRegistry,
    };
}

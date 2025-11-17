import type React from 'react';

import type {TMessagePart} from '../types/messages';

export type MessagePartComponentProps<TPart extends TMessagePart = TMessagePart> = {
    part: TPart;
};

export type MessageRenderer<TPart extends TMessagePart = TMessagePart> = {
    component: React.ComponentType<MessagePartComponentProps<TPart>>;
};

export type MessageRendererRegistry = Record<string, MessageRenderer>;

export function createMessageRendererRegistry(): MessageRendererRegistry {
    return {};
}

export function registerMessageRenderer<TPart extends TMessagePart>(
    registry: MessageRendererRegistry,
    partType: TPart['type'],
    renderer: MessageRenderer<TPart>,
): MessageRendererRegistry {
    Object.assign(registry, {
        [partType]: renderer as unknown as MessageRenderer,
    });
    return registry;
}

export function getMessageRenderer(
    registry: MessageRendererRegistry,
    partType: string,
): React.ComponentType<MessagePartComponentProps> | undefined {
    return registry[partType]?.component;
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

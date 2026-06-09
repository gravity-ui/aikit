import type React from 'react';

import type {TMessageContent} from '../types/messages';

export type MessageContentComponentProps<TContent extends TMessageContent = TMessageContent> = {
    part: TContent;
};

export type MessageRenderer<TContent extends TMessageContent = TMessageContent> = {
    component: React.ComponentType<MessageContentComponentProps<TContent>>;
};

export type MessageRendererRegistry = Record<string, MessageRenderer>;

const defaultRenderers = new WeakSet<MessageRenderer>();

export function createMessageRendererRegistry(): MessageRendererRegistry {
    return {};
}

export type RegisterMessageRendererOptions = {
    /**
     * Marks a renderer as built-in. Replacing built-in renderers is expected
     * when consumers customize the default registry, so it does not warn.
     */
    isDefault?: boolean;
};

export function registerMessageRenderer<TContent extends TMessageContent>(
    registry: MessageRendererRegistry,
    contentType: TContent['type'],
    renderer: MessageRenderer<TContent>,
    options?: RegisterMessageRendererOptions,
): MessageRendererRegistry {
    const existingRenderer = registry[contentType];
    if (
        process.env.NODE_ENV !== 'production' &&
        existingRenderer &&
        !defaultRenderers.has(existingRenderer)
    ) {
        // eslint-disable-next-line no-console
        console.warn(
            `registerMessageRenderer: overwriting existing renderer for content type "${contentType}"`,
        );
    }
    const registeredRenderer = renderer as unknown as MessageRenderer;
    if (options?.isDefault) {
        defaultRenderers.add(registeredRenderer);
    }
    Object.assign(registry, {
        [contentType]: registeredRenderer,
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

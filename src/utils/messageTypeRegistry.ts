import type {TBaseMessagePart, TMessagePart} from '../types/messages';

export type MessagePartComponentProps<TPart extends TBaseMessagePart = TMessagePart> = {
    part: TPart;
};

export type MessageRenderer<TPart extends TBaseMessagePart = TMessagePart> = {
    component: React.ComponentType<MessagePartComponentProps<TPart>>;
};

export type MessageRendererRegistry = Record<string, MessageRenderer>;

export function createMessageRendererRegistry(): MessageRendererRegistry {
    return {};
}

export function registerMessageRenderer<TPart extends TBaseMessagePart>(
    registry: MessageRendererRegistry,
    partType: TPart['type'],
    renderer: MessageRenderer<TPart>,
): MessageRendererRegistry {
    // eslint-disable-next-line no-param-reassign
    registry[partType] = renderer as unknown as MessageRenderer;
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

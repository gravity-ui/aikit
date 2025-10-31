/**
 * Message Type Registry utilities
 */
// @todo change to real type
type MessageComponentProps<TData = unknown> = {
    message: TData;
};
type MessageTypeRegistry<TData = unknown> = {
    [type: string]: {
        component: React.ComponentType<MessageComponentProps<TData>>;
        validator?: (message: unknown) => boolean;
        defaultProps?: Partial<MessageComponentProps<TData>>;
        metadata?: {
            name: string;
            description: string;
            icon?: React.ComponentType;
            category?: string;
        };
    };
};

/**
 * Create a new message type registry
 */
export function createMessageTypeRegistry(): MessageTypeRegistry {
    return {};
}

/**
 * Register a message type in the registry
 */
export function registerMessageType<TData = unknown>(
    registry: MessageTypeRegistry,
    type: string,
    config: {
        component: React.ComponentType<MessageComponentProps<TData>>;
        validator?: (message: unknown) => boolean;
        defaultProps?: Partial<MessageComponentProps<TData>>;
        metadata?: {
            name: string;
            description: string;
            icon?: React.ComponentType;
            category?: string;
        };
    },
): MessageTypeRegistry {
    return {
        ...registry,
        [type]: config as MessageTypeRegistry[string],
    };
}

/**
 * Get message component from registry
 */
export function getMessageComponent(
    registry: MessageTypeRegistry,
    type: string,
): React.ComponentType<MessageComponentProps> | undefined {
    return registry[type]?.component;
}

/**
 * Validate message against registered validator
 */
export function validateMessage(
    registry: MessageTypeRegistry,
    type: string,
    message: unknown,
): boolean {
    const validator = registry[type]?.validator;
    return validator ? validator(message) : true;
}

/**
 * Get all registered message types
 */
export function getRegisteredTypes(registry: MessageTypeRegistry): string[] {
    return Object.keys(registry);
}

/**
 * Check if message type is registered
 */
export function isTypeRegistered(registry: MessageTypeRegistry, type: string): boolean {
    return type in registry;
}

/**
 * Get default props for message type
 */
export function getDefaultProps(
    registry: MessageTypeRegistry,
    type: string,
): Partial<MessageComponentProps> | undefined {
    return registry[type]?.defaultProps;
}

/**
 * Get metadata for message type
 */
export function getMessageTypeMetadata(
    registry: MessageTypeRegistry,
    type: string,
):
    | {
          name: string;
          description: string;
          icon?: React.ComponentType;
          category?: string;
      }
    | undefined {
    return registry[type]?.metadata;
}

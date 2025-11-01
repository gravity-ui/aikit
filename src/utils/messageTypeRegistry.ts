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
 * @returns An empty message type registry
 */
export function createMessageTypeRegistry(): MessageTypeRegistry {
    return {};
}

/**
 * Register a message type in the registry
 * @param registry - The message type registry to register in
 * @param type - The message type identifier
 * @param config - Configuration object for the message type
 * @returns The updated message type registry
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
 * @param registry - The message type registry to query
 * @param type - The message type identifier
 * @returns The component for the message type, or undefined if not found
 */
export function getMessageComponent(
    registry: MessageTypeRegistry,
    type: string,
): React.ComponentType<MessageComponentProps> | undefined {
    return registry[type]?.component;
}

/**
 * Validate message against registered validator
 * @param registry - The message type registry to query
 * @param type - The message type identifier
 * @param message - The message to validate
 * @returns True if message is valid or no validator is registered, false otherwise
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
 * @param registry - The message type registry to query
 * @returns Array of all registered message type identifiers
 */
export function getRegisteredTypes(registry: MessageTypeRegistry): string[] {
    return Object.keys(registry);
}

/**
 * Check if message type is registered
 * @param registry - The message type registry to query
 * @param type - The message type identifier to check
 * @returns True if the type is registered, false otherwise
 */
export function isTypeRegistered(registry: MessageTypeRegistry, type: string): boolean {
    return type in registry;
}

/**
 * Get default props for message type
 * @param registry - The message type registry to query
 * @param type - The message type identifier
 * @returns Default props for the message type, or undefined if not found
 */
export function getDefaultProps(
    registry: MessageTypeRegistry,
    type: string,
): Partial<MessageComponentProps> | undefined {
    return registry[type]?.defaultProps;
}

/**
 * Get metadata for message type
 * @param registry - The message type registry to query
 * @param type - The message type identifier
 * @returns Metadata for the message type, or undefined if not found
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

// Types
export type {
    GenUIComponentProps,
    GenUIContext,
    GenUIError,
    GenUIErrorEvent,
    GenUIErrorProps,
    GenUILoadingProps,
    GenUITool,
    GenUIToolRegistry,
    ToolResultEvent,
} from './types';

// Registry
export {
    createGenUIToolRegistry,
    getGenUITool,
    mergeGenUIToolRegistries,
    registerGenUITool,
    type GenUIToolDefinition,
} from './registry';

// Schema
export {
    normalizeSchema,
    validateArgs,
    type ArgsSchema,
    type SchemaResult,
    type SchemaSuccess,
    type SchemaFailure,
} from './schema';

// Catalog
export {
    describeGenUIRegistry,
    type GenUIToolCatalog,
    type GenUIToolCatalogEntry,
} from './describeRegistry';

// Renderers
export {createToolCallRenderer, type ToolCallRendererOptions} from './renderers/ToolCallRenderer';
export {createToolResultRenderer} from './renderers/ToolResultRenderer';
export {DefaultErrorSlot} from './renderers/DefaultErrorSlot';
export {DefaultLoadingSkeleton} from './renderers/DefaultLoadingSkeleton';
export {ToolPartErrorBoundary} from './renderers/ToolPartErrorBoundary';
export {UnknownToolFallback} from './renderers/UnknownToolFallback';

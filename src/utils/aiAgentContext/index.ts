// Components
export {AIAgentContextProvider, useAIAgentContext} from './AIAgentContext';
export {AIData, useProvideAIData} from './AIData';

// Utilities
export {buildAIContextSystemPrompt} from './buildAIContextSystemPrompt';
export {AIPrompt, DEFAULT_SYSTEM_PROMPT_TEMPLATE} from './templateStrings';

// Types
export type {
    AIDataProps,
    AIDataEntry,
    AIAgentContextAPI,
    BuildAIContextOptions,
    PromptBuilder,
    PromptBuilderParams,
    PromptBuilderExpression,
    PromptBuilderExpressionOptions,
} from './types';

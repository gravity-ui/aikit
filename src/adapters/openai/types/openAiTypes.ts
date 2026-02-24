/**
 * OpenAI Responses API types (source of truth: openai SDK, optionalDependencies).
 * Compatible with openai ^6.x (Responses API).
 * Import path: openai/resources/responses/responses.
 * We re-use SDK types where possible; permissive variants (optional fields) only for
 * raw SSE and partial API responses.
 */
import type {ResponseOutputRefusal, ResponseOutputText} from 'openai/resources/responses/responses';

/** Minimal response shape (Response subset); all optional for partial/SSE. */
export type OpenAIResponseLike = {
    id?: string;
    error?: {code?: string; message?: string} | null;
    metadata?: Record<string, string> | null;
    output?: OpenAIResponseOutputItem[] | null;
};

/** ResponseOutputMessage; id optional for stream/SSE. */
export type OpenAIResponseOutputMessage = {
    type: 'message';
    id?: string;
    role: 'assistant';
    content: Array<OpenAIResponseOutputText | OpenAIResponseOutputRefusal>;
    status?: 'in_progress' | 'completed' | 'incomplete';
};

/** ResponseOutputText; annotations optional for raw SSE / partial responses. */
export type OpenAIResponseOutputText = Pick<ResponseOutputText, 'text' | 'type'> & {
    annotations?: ResponseOutputText['annotations'];
};

/** Re-export from openai. */
export type OpenAIResponseOutputRefusal = ResponseOutputRefusal;

/** ResponseReasoningItem; id/summary optional for stream. */
export type OpenAIResponseReasoningItem = {
    type: 'reasoning';
    id?: string;
    content?: Array<{type: 'reasoning_text'; text: string}>;
    summary?: Array<{type: string; text: string}>;
};

/** ResponseFunctionToolCall; arguments optional for stream. */
export type OpenAIResponseFunctionToolCall = {
    type: 'function_call';
    call_id: string;
    name: string;
    arguments?: string;
    id?: string;
};

/** ResponseOutputItem.McpCall; name/server_label/arguments optional for stream. */
export type OpenAIResponseMcpCallLike = {
    type: 'mcp_call';
    id: string;
    name?: string;
    server_label?: string;
    arguments?: string;
    status?: 'in_progress' | 'completed' | 'incomplete' | 'calling' | 'failed';
    output?: string | null;
    error?: string | null;
};

/** ResponseOutputItem.McpApprovalRequest; name/server_label/arguments optional for stream. */
export type OpenAIResponseMcpApprovalRequestLike = {
    type: 'mcp_approval_request';
    id: string;
    name?: string;
    server_label?: string;
    arguments?: string;
};

/** Future: if API adds mcp_submission_request, map to waitingSubmission. */
export type OpenAIResponseMcpSubmissionRequestLike = {
    type: 'mcp_submission_request';
    id: string;
    name?: string;
    server_label?: string;
    arguments?: string;
};

export type OpenAIResponseOutputItem =
    | OpenAIResponseOutputMessage
    | OpenAIResponseReasoningItem
    | OpenAIResponseFunctionToolCall
    | OpenAIResponseMcpCallLike
    | OpenAIResponseMcpApprovalRequestLike
    | OpenAIResponseMcpSubmissionRequestLike
    | {type: string};

/** Permissive item for stream events (response.output_item.added/done). */
export type OpenAIStreamOutputItemLike = {type?: string; [key: string]: unknown};

/** ResponseStreamEvent-compatible; includes SSE wrapper (event/data) for raw fetch. */
export type OpenAIStreamEventLike =
    | {type: 'response.output_text.delta'; delta: string}
    | {type: 'response.output_text.done'; text?: string}
    | {type: 'response.content_part.delta'; delta?: string}
    | {type: 'response.output_item.added'; item?: OpenAIStreamOutputItemLike}
    | {type: 'response.output_item.done'; item?: OpenAIStreamOutputItemLike}
    | {type: 'response.mcp_call.in_progress'; item_id: string}
    | {type: 'response.mcp_call.completed'; item_id: string}
    | {type: 'response.mcp_call.failed'; item_id: string}
    | {type: 'response.reasoning_text.delta'; item_id: string; delta: string}
    | {type: 'response.reasoning_text.done'; item_id: string; text: string}
    | {type: 'response.refusal.delta'; item_id: string; delta: string; output_index?: number}
    | {type: 'response.refusal.done'; item_id: string; output_index?: number; refusal: string}
    | {type: 'response.reasoning_summary_text.delta'; item_id: string; delta: string}
    | {type: 'response.reasoning_summary_text.done'; item_id: string; text: string}
    | {type: 'response.file_search_call.searching'; item_id: string}
    | {type: 'response.file_search_call.completed'; item_id: string}
    | {type: 'response.file_search_call.in_progress'; item_id: string}
    | {type: 'response.web_search_call.in_progress'; item_id: string}
    | {type: 'response.web_search_call.completed'; item_id: string}
    | {type: 'response.web_search_call.searching'; item_id: string}
    | {type: 'response.code_interpreter_call.interpreting'; item_id: string}
    | {type: 'response.code_interpreter_call.completed'; item_id: string}
    | {type: 'response.code_interpreter_call.in_progress'; item_id: string}
    | {type: 'response.image_generation_call.generating'; item_id: string}
    | {type: 'response.image_generation_call.completed'; item_id: string}
    | {type: 'response.image_generation_call.in_progress'; item_id: string}
    | {type: 'response.mcp_list_tools.in_progress'; item_id: string}
    | {type: 'response.mcp_list_tools.completed'; item_id: string}
    | {type: 'response.mcp_list_tools.failed'; item_id: string; error?: string}
    | {type: 'response.done'}
    | {type: 'response.completed'}
    | {type: 'response.failed'}
    | {type: 'error'; error?: string}
    | {
          event?: string;
          data?: {
              type?: string;
              delta?: string;
              text?: string;
              item?: OpenAIStreamOutputItemLike;
              item_id?: string;
          };
          item?: OpenAIStreamOutputItemLike;
          item_id?: string;
          error?: string;
          refusal?: string;
      }
    | {text?: string}
    | {type?: string; [key: string]: unknown};

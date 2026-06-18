import {getStreamEventContentUpdate} from '../getStreamEventContentUpdate';

describe('getStreamEventContentUpdate — reasoning', () => {
    it('maps reasoning_text.done to thinking_done, not text_delta', () => {
        const update = getStreamEventContentUpdate({
            type: 'response.reasoning_text.done',
            item_id: 'rsn-1',
            text: 'Full reasoning text.',
        });
        expect(update).toEqual({
            kind: 'thinking_done',
            item_id: 'rsn-1',
            text: 'Full reasoning text.',
        });
    });

    it('maps reasoning_summary_text.done to thinking_done, not text_delta', () => {
        const update = getStreamEventContentUpdate({
            type: 'response.reasoning_summary_text.done',
            item_id: 'rsn-1',
            text: 'Summary text.',
        });
        expect(update).toEqual({
            kind: 'thinking_done',
            item_id: 'rsn-1',
            text: 'Summary text.',
        });
    });
});

describe('getStreamEventContentUpdate — MCP output_item.done', () => {
    it('maps completed + application error in output XML to tool_update error', () => {
        const update = getStreamEventContentUpdate({
            type: 'response.output_item.done',
            item: {
                type: 'mcp_call',
                id: 'tool-cc-abc-0',
                name: 'get_table_schema',
                server_label: 'server',
                status: 'completed',
                output: '<schema error="true">Error getting table schema</schema>',
            },
        });
        expect(update).toMatchObject({
            kind: 'tool_update',
            item_id: 'tool-cc-abc-0',
            status: 'error',
        });
    });

    it('maps completed + healthy output to success', () => {
        const update = getStreamEventContentUpdate({
            type: 'response.output_item.done',
            item: {
                type: 'mcp_call',
                id: 'tool-cc-abc-0',
                name: 'get_table_schema',
                status: 'completed',
                output: '<schema ok="true"/>',
            },
        });
        expect(update).toMatchObject({
            kind: 'tool_update',
            item_id: 'tool-cc-abc-0',
            status: 'success',
        });
    });

    it('maps status "complete" (variant) to terminal success when output has no app error', () => {
        const update = getStreamEventContentUpdate({
            type: 'response.output_item.done',
            item: {
                type: 'mcp_call',
                id: 't1',
                status: 'complete',
                output: '{}',
            },
        });
        expect(update).toMatchObject({kind: 'tool_update', status: 'success'});
    });

    it('does not leave loading when output is present but status string is missing', () => {
        const update = getStreamEventContentUpdate({
            type: 'response.output_item.done',
            item: {
                type: 'mcp_call',
                id: 't1',
                output: 'done',
            },
        });
        expect(update).toMatchObject({kind: 'tool_update', status: 'success'});
    });
});

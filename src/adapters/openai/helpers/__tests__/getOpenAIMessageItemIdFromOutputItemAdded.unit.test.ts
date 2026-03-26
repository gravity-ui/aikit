import {getOpenAIMessageItemIdFromOutputItemAdded} from '../getOpenAIMessageItemIdFromOutputItemAdded';

describe('getOpenAIMessageItemIdFromOutputItemAdded', () => {
    it('returns message id for response.output_item.added with type message', () => {
        const id = 'msg-cc-329071087fe74a1783f19d24b9874632';
        expect(
            getOpenAIMessageItemIdFromOutputItemAdded({
                type: 'response.output_item.added',
                item: {
                    type: 'message',
                    id,
                    role: 'assistant',
                    status: 'in_progress',
                    content: [],
                },
            }),
        ).toBe(id);
    });

    it('returns null for non-message output items', () => {
        expect(
            getOpenAIMessageItemIdFromOutputItemAdded({
                type: 'response.output_item.added',
                item: {type: 'mcp_call', id: 'tool-1', name: 'x'},
            }),
        ).toBeNull();
    });

    it('returns null for other event types', () => {
        expect(
            getOpenAIMessageItemIdFromOutputItemAdded({
                type: 'response.output_text.delta',
                delta: 'x',
                item_id: 'msg-cc-1',
            }),
        ).toBeNull();
    });
});

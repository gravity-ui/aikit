import {serializeChatRequest} from '../request';

const selections = [{sourceId: 'commands', id: 'review', title: 'Review', data: {mode: 'review'}}];
const data = {content: 'Review this', selections};
const base = {
    messages: [{role: 'user', content: data.content}],
    fileIds: ['file-1'],
    previousResponseId: 'response-1',
};

describe('AIStudioChat request mapping', () => {
    it('gives the application the final request and selection snapshot', async () => {
        const transform = jest.fn(async (request, draft) => ({
            ...request,
            metadata: {commands: draft.selections},
        }));
        const body = await serializeChatRequest(base, data, transform);
        expect(transform).toHaveBeenCalledWith(base, data);
        expect(JSON.parse(body as string)).toEqual({...base, metadata: {commands: selections}});
    });
    it('does not send selected data without an application mapping', async () => {
        expect(await serializeChatRequest(base, data, undefined)).toBe(JSON.stringify(base));
    });
    it('supports cancellation and propagates mapping errors to the send lifecycle', async () => {
        expect(await serializeChatRequest(base, data, () => false)).toBe(false);
        await expect(
            serializeChatRequest(base, data, async () => {
                throw new Error('Preparation failed');
            }),
        ).rejects.toThrow('Preparation failed');
    });
    it('retries the exact serialized request without rerunning callbacks or reading newer selections', async () => {
        const request = {...base, context: {documents: ['doc-1']}};
        const body = await serializeChatRequest(request, data, undefined);
        request.context.documents.push('doc-2');
        const transform = jest.fn(() => ({unexpected: true}));
        expect(
            await serializeChatRequest(
                {messages: []},
                {content: 'New draft', selections: []},
                transform,
                body as string,
            ),
        ).toBe(body);
        expect(JSON.parse(body as string).context.documents).toEqual(['doc-1']);
        expect(transform).not.toHaveBeenCalled();
    });
});

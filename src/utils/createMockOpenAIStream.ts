import {v4 as uuid} from 'uuid';

import openaiResponseStream from './__mocks__/openai-response-chunks.json';
import openaiResponseStreamClientTool from './__mocks__/openai-response-client-tool.json';

const createStreamData = (
    mockJson: typeof openaiResponseStream | typeof openaiResponseStreamClientTool,
) => {
    const idMatchMap: Record<string, string> = {};

    return mockJson.map((chunk) => {
        if (chunk.response && chunk.response.id) {
            if (!idMatchMap[chunk.response.id]) {
                const newRespId = `resp-${uuid()}`;
                idMatchMap[chunk.response.id] = newRespId;
            }

            return {
                ...chunk,
                response: {
                    ...chunk.response,
                    id: idMatchMap[chunk.response.id],
                },
            };
        }

        if (chunk.item) {
            if (!idMatchMap[chunk.item.id]) {
                const prefix = chunk.item.id.startsWith('tool') ? 'tool-cc' : 'msg-cc';
                const newItemId = `${prefix}-${uuid()}`;
                idMatchMap[chunk.item.id] = newItemId;
            }

            return {
                ...chunk,
                item: {
                    ...chunk.item,
                    id: idMatchMap[chunk.item.id],
                },
            };
        }

        if (chunk.item_id) {
            if (!idMatchMap[chunk.item_id]) {
                const prefix = chunk.item_id.startsWith('tool') ? 'tool-cc' : 'msg-cc';
                const newItemId = `${prefix}-${uuid()}`;
                idMatchMap[chunk.item_id] = newItemId;
            }
            return {...chunk, item_id: idMatchMap[chunk.item_id]};
        }

        throw new Error('unknown chunk type');
    });
};

export const createMockOpenAIStream = () => {
    const readableStream = new ReadableStream({
        async start(controller) {
            const streamData = createStreamData(openaiResponseStream);

            for (const chunk of streamData) {
                const dataString = JSON.stringify(chunk).trim();
                controller.enqueue(new TextEncoder().encode(`data: ${dataString}\n`));
                await new Promise((r) => setTimeout(r, 10));
            }
            controller.close();
        },
    });

    return readableStream;
};

export const createMockOpenAIClientToolStream = () => {
    const readableStream = new ReadableStream({
        async start(controller) {
            const streamData = createStreamData(openaiResponseStreamClientTool);

            for (const chunk of streamData) {
                const dataString = JSON.stringify(chunk).trim();
                controller.enqueue(new TextEncoder().encode(`data: ${dataString}\n`));
                await new Promise((r) => setTimeout(r, 10));
            }
            controller.close();
        },
    });

    return readableStream;
};

#!/usr/bin/env node
import {createServer} from 'node:http';
import {URL} from 'node:url';

const PORT = Number(process.env.PORT ?? 8787);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
);
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
    // eslint-disable-next-line no-console
    console.error('Missing OPENAI_API_KEY. Set it in .env or your shell.');
    process.exit(1);
}

const CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'POST, OPTIONS',
};

function readJson(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch (err) {
                reject(err);
            }
        });
        req.on('error', reject);
    });
}

function buildPayload(body) {
    const payload = {
        model: body.model ?? OPENAI_MODEL,
        messages: body.messages,
        stream: false,
    };
    if (Array.isArray(body.tools) && body.tools.length > 0) {
        payload.tools = body.tools;
    }
    if (body.tool_choice !== undefined) {
        payload.tool_choice = body.tool_choice;
    }
    if (typeof body.temperature === 'number') {
        payload.temperature = body.temperature;
    }
    return payload;
}

// Some gateways (e.g. Yandex Eliza) wrap the OpenAI payload as
// `{ key, response: {...}, attempt_count, ... }`. Unwrap so the client sees a
// flat chat-completions response.
function unwrapGatewayEnvelope(text) {
    try {
        const parsed = JSON.parse(text);
        if (
            parsed &&
            typeof parsed === 'object' &&
            !Array.isArray(parsed.choices) &&
            parsed.response &&
            Array.isArray(parsed.response.choices)
        ) {
            return JSON.stringify(parsed.response);
        }
    } catch {
        // Non-JSON body — forward as-is.
    }
    return text;
}

async function handleChat(req, res) {
    const upstreamUrl = `${OPENAI_BASE_URL}/chat/completions`;
    try {
        const body = await readJson(req);
        const payload = buildPayload(body);
        // eslint-disable-next-line no-console
        console.log(
            `[proxy] -> ${upstreamUrl} model=${payload.model} messages=${payload.messages?.length ?? 0} tools=${payload.tools?.length ?? 0}`,
        );
        const upstream = await fetch(upstreamUrl, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });
        const text = await upstream.text();
        if (upstream.ok) {
            // eslint-disable-next-line no-console
            console.log(`[proxy] <- ${upstream.status} ${upstream.statusText}`);
        } else {
            // eslint-disable-next-line no-console
            console.error(
                `[proxy] upstream ${upstream.status} ${upstream.statusText}\n${text.slice(0, 2000)}`,
            );
        }
        const outBody = upstream.ok ? unwrapGatewayEnvelope(text) : text;
        res.writeHead(upstream.status, {
            ...CORS_HEADERS,
            'content-type': upstream.headers.get('content-type') ?? 'application/json',
        });
        res.end(outBody);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[proxy] fetch threw for ${upstreamUrl}:`, err);
        res.writeHead(500, {...CORS_HEADERS, 'content-type': 'application/json'});
        res.end(
            JSON.stringify({
                error: err?.message ?? String(err),
                upstreamUrl,
            }),
        );
    }
}

const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    const {pathname} = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'POST' && pathname === '/api/chat') {
        await handleChat(req, res);
        return;
    }

    if (req.method === 'GET' && pathname === '/health') {
        res.writeHead(200, {...CORS_HEADERS, 'content-type': 'application/json'});
        res.end(JSON.stringify({ok: true, model: OPENAI_MODEL, baseUrl: OPENAI_BASE_URL}));
        return;
    }

    res.writeHead(404, CORS_HEADERS);
    res.end();
});

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`genui-live-proxy listening on http://localhost:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`  upstream: ${OPENAI_BASE_URL}/chat/completions`);
    // eslint-disable-next-line no-console
    console.log(`  model:    ${OPENAI_MODEL}`);
});

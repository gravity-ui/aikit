# genui-live-proxy

A tiny zero-dependency Node proxy used by the `genui/Live` Storybook story to
talk to an OpenAI-compatible Responses API without exposing the API key to the
browser.

## Why a proxy?

Storybook bundles the client code into the browser. If we put the API key into
a `STORYBOOK_*` env var, anyone who opens the static build can read it. The
proxy keeps the key server-side and gives the story a single endpoint
(`POST /api/chat`) to call.

## Setup

```bash
cd examples/genui-live-proxy
cp .env.example .env
# edit .env — set OPENAI_API_KEY at minimum
npm run start
```

Requires Node 20.6+ (for `--env-file`).

## Env vars

| Variable          | Default                     | Purpose                                        |
| ----------------- | --------------------------- | ---------------------------------------------- |
| `OPENAI_API_KEY`  | _(required)_                | Bearer token sent to upstream.                 |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Override for any OpenAI-compatible endpoint.   |
| `OPENAI_MODEL`    | `gpt-4o-mini`               | Default model when the story does not specify. |
| `PORT`            | `8787`                      | Local port the proxy listens on.               |

> The proxy posts to `${OPENAI_BASE_URL}/chat/completions` — the
> OpenAI-compatible Chat Completions API. Works with OpenAI, OpenRouter,
> Groq, Together, vLLM, LM Studio, and most other providers.

## TLS / self-signed certs

If your upstream is fronted by an internal CA you'll see
`SELF_SIGNED_CERT_IN_CHAIN` from `fetch`. Two options:

- **Trust the CA (recommended):** set `NODE_EXTRA_CA_CERTS=/path/to/ca.pem` in
  `.env`. Node reads this at startup; no code change.
- **Disable TLS verification (dev only, insecure):** set
  `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env`. Localhost proxies only.

## Endpoints

- `POST /api/chat` — body `{model?, messages, tools?, tool_choice?, temperature?}`
  is forwarded to upstream `/chat/completions` with `stream: false`. Status and
  body are passed through.
- `GET /health` — sanity check; returns `{ok, model, baseUrl}`.

## Running the story

1. Start the proxy: `npm run start` (in this directory).
2. From the repo root, start Storybook: `npm start`.
3. Open `genui/Live` and chat. The story sends every turn through the proxy.

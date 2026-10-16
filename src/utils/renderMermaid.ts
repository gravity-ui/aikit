import {v4 as uuidv4} from 'uuid';

// Mermaid has global configuration. Serialize initialization and rendering so
// diagrams in differently themed providers cannot change each other's theme.
let renderQueue: Promise<unknown> = Promise.resolve();

export function renderMermaid(
    source: string,
    theme: 'light' | 'dark',
    isActive: () => boolean,
): Promise<string | undefined> {
    const result = renderQueue.then(async () => {
        if (!isActive()) {
            return undefined;
        }
        const {default: mermaid} = await import('mermaid');
        if (!isActive()) {
            return undefined;
        }

        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            suppressErrorRendering: true,
            theme: theme === 'dark' ? 'dark' : 'default',
            // Diagram directives must not override the host's theme or security.
            secure: [
                'secure',
                'securityLevel',
                'startOnLoad',
                'maxTextSize',
                'maxEdges',
                'suppressErrorRendering',
                'theme',
                'themeVariables',
                'themeCSS',
            ],
        });

        // A connected, invisible host allows SVG text measurement without
        // exposing Mermaid's temporary DOM or error diagrams to the message.
        const host = document.createElement('div');
        host.style.position = 'absolute';
        host.style.visibility = 'hidden';
        host.style.pointerEvents = 'none';
        host.setAttribute('aria-hidden', 'true');
        document.body.appendChild(host);
        try {
            const {svg} = await mermaid.render(`aikit-mermaid-${uuidv4()}`, source, host);
            return svg;
        } finally {
            host.remove();
        }
    });

    renderQueue = result.catch(() => undefined);
    return result;
}

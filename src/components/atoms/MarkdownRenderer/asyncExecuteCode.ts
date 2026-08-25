const HANDLERS_KEY = '__gravityUiAikitMdxLoader__';

interface ExecutionHandler<T> {
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
}

type ExecutionHandlers = Record<string, ExecutionHandler<unknown>>;

export function resolveCspNonce(nonce?: string) {
    if (nonce || typeof document === 'undefined') {
        return nonce;
    }

    return document.querySelector<HTMLScriptElement>('script[nonce]')?.nonce || undefined;
}

/** Executes code through a nonce-aware script without using `eval` or `new Function`. */
export async function asyncExecuteCode<T>(code: string, nonce?: string): Promise<T> {
    const globalScope = window as unknown as Record<string, unknown>;
    const handlers = (globalScope[HANDLERS_KEY] ??= {}) as ExecutionHandlers;
    const resolvedNonce = resolveCspNonce(nonce);

    let id: string;
    do {
        id = Math.random().toString(36).substring(2);
    } while (handlers[id]);

    const script = document.createElement('script');
    if (resolvedNonce) {
        script.setAttribute('nonce', resolvedNonce);
    }

    const promise = new Promise<T>((resolve, reject) => {
        let wasHandled = false;

        handlers[id] = {
            resolve: (value) => {
                wasHandled = true;
                resolve(value as T);
            },
            reject: (reason) => {
                wasHandled = true;
                reject(reason);
            },
        };

        script.textContent = `(function(handlers) {
    try {
        handlers['${id}'].resolve(function() {
            ${code}
        });
    } catch (error) {
        handlers['${id}'].reject(error);
    }
    delete handlers['${id}'];
})(window.${HANDLERS_KEY});`;

        document.head.appendChild(script);

        // Inline classic scripts execute synchronously when inserted. If neither handler
        // ran before appendChild returned, the browser most likely blocked the script via CSP.
        if (!wasHandled) {
            reject(
                new Error(
                    'Failed to execute MDX script. It may have been blocked by Content Security Policy.',
                ),
            );
        }
    });

    return promise.finally(() => {
        delete handlers[id];
        script.parentNode?.removeChild(script);

        if (Object.keys(handlers).length === 0) {
            delete globalScope[HANDLERS_KEY];
        }
    });
}

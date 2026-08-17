const HANDLERS_KEY = '__gravityUiAikitMdxLoader__';

interface ExecutionHandler<T> {
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
}

type ExecutionHandlers = Record<string, ExecutionHandler<unknown>>;

/** Executes code through a nonce-aware script without using `eval` or `new Function`. */
export async function asyncExecuteCode<T>(code: string, nonce?: string): Promise<T> {
    const globalScope = window as unknown as Record<string, unknown>;
    const handlers = (globalScope[HANDLERS_KEY] ??= {}) as ExecutionHandlers;

    let id: string;
    do {
        id = Math.random().toString(36).substring(2);
    } while (handlers[id]);

    const script = document.createElement('script');
    if (nonce) {
        script.setAttribute('nonce', nonce);
    }

    const promise = new Promise<T>((resolve, reject) => {
        handlers[id] = {resolve: resolve as ExecutionHandler<unknown>['resolve'], reject};

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
    });

    return promise.finally(() => {
        delete handlers[id];
        script.parentNode?.removeChild(script);

        if (Object.keys(handlers).length === 0) {
            delete globalScope[HANDLERS_KEY];
        }
    });
}

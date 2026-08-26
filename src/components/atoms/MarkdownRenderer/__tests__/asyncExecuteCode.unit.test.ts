import {asyncExecuteCode} from '../asyncExecuteCode';

const HANDLERS_KEY = '__gravityUiAikitMdxLoader__';

interface ExecutionHandler<T> {
    resolve: (value: T) => void;
}

describe('asyncExecuteCode', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        document.head.replaceChildren();
        delete (window as unknown as Record<string, unknown>)[HANDLERS_KEY];
    });

    test('should execute code through a script using the provided nonce', async () => {
        const pageScript = document.createElement('script');
        pageScript.nonce = 'page-nonce';
        document.head.appendChild(pageScript);

        const executor = () => 'result';
        let scriptSource = '';

        jest.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
            const script = node as HTMLScriptElement;
            const handlers = (window as unknown as Record<string, unknown>)[HANDLERS_KEY] as Record<
                string,
                ExecutionHandler<typeof executor>
            >;
            const [handler] = Object.values(handlers);

            expect(script.nonce).toBe('test-nonce');
            scriptSource = script.textContent ?? '';
            handler.resolve(executor);

            return node;
        });

        await expect(asyncExecuteCode('return "result";', 'test-nonce')).resolves.toBe(executor);
        expect(scriptSource).toContain('resolve(function()');
        expect(scriptSource).toContain('return "result";');
        expect(scriptSource).not.toMatch(/new Function|eval\s*\(/);
        expect((window as unknown as Record<string, unknown>)[HANDLERS_KEY]).toBeUndefined();
    });

    test('should discover the nonce from an existing script', async () => {
        const emptyNonceScript = document.createElement('script');
        emptyNonceScript.setAttribute('nonce', '');
        document.head.appendChild(emptyNonceScript);

        const pageScript = document.createElement('script');
        pageScript.nonce = 'page-nonce';
        document.head.appendChild(pageScript);

        const executor = () => 'result';

        jest.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
            const script = node as HTMLScriptElement;
            const handlers = (window as unknown as Record<string, unknown>)[HANDLERS_KEY] as Record<
                string,
                ExecutionHandler<typeof executor>
            >;
            const [handler] = Object.values(handlers);

            expect(script.nonce).toBe('page-nonce');
            handler.resolve(executor);

            return node;
        });

        await expect(asyncExecuteCode('return "result";')).resolves.toBe(executor);
    });

    test('should reject and clean up when the script is not executed', async () => {
        const blockedScripts = document.createElement('div');

        jest.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
            blockedScripts.appendChild(node);

            return node;
        });

        await expect(asyncExecuteCode('return "result";', 'invalid-nonce')).rejects.toThrow(
            'It may have been blocked by Content Security Policy',
        );

        expect(blockedScripts.querySelector('script')).toBeNull();
        expect((window as unknown as Record<string, unknown>)[HANDLERS_KEY]).toBeUndefined();
    });
});

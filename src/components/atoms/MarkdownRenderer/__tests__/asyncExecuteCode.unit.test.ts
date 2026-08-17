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
});

import {renderMermaid} from '../renderMermaid';

const initialize = jest.fn();
const render = jest.fn();
const load = jest.fn(async () => ({
    default: {
        initialize: (...args: unknown[]) => initialize(...args),
        render: (...args: unknown[]) => render(...args),
    },
}));
jest.mock('uuid', () => ({v4: () => 'diagram-id'}));

describe('renderMermaid', () => {
    beforeEach(() => {
        load.mockClear();
        initialize.mockReset();
        render.mockReset();
    });

    test('serializes theme configuration with rendering and cleans temporary hosts', async () => {
        let finishFirst!: (value: {svg: string}) => void;
        const firstRender = new Promise<{svg: string}>((resolve) => {
            finishFirst = resolve;
        });
        render.mockReturnValueOnce(firstRender).mockResolvedValueOnce({svg: '<svg>dark</svg>'});
        const light = renderMermaid('graph TD; A-->B', 'light', () => true, load);
        const dark = renderMermaid('graph TD; C-->D', 'dark', () => true, load);
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(initialize).toHaveBeenLastCalledWith(
            expect.objectContaining({theme: 'default', securityLevel: 'strict'}),
        );
        const host = render.mock.calls[0][2] as HTMLElement;
        expect(host.isConnected).toBe(true);
        finishFirst({svg: '<svg>light</svg>'});
        await expect(light).resolves.toBe('<svg>light</svg>');
        await expect(dark).resolves.toBe('<svg>dark</svg>');
        expect(initialize).toHaveBeenLastCalledWith(expect.objectContaining({theme: 'dark'}));
        expect(host.isConnected).toBe(false);
        expect(render.mock.calls[1][2].isConnected).toBe(false);
    });

    test('recovers after a failed diagram and removes its temporary DOM', async () => {
        render.mockRejectedValueOnce(new Error('Invalid syntax'));
        await expect(renderMermaid('invalid', 'light', () => true, load)).rejects.toThrow(
            'Invalid syntax',
        );
        expect(render.mock.calls[0][2].isConnected).toBe(false);

        render.mockResolvedValueOnce({svg: '<svg />'});
        await expect(renderMermaid('graph TD; A-->B', 'light', () => true, load)).resolves.toBe(
            '<svg />',
        );
    });

    test('skips obsolete queued work', async () => {
        await expect(
            renderMermaid('graph TD; A-->B', 'light', () => false, load),
        ).resolves.toBeUndefined();
        expect(load).not.toHaveBeenCalled();
        expect(initialize).not.toHaveBeenCalled();
        expect(render).not.toHaveBeenCalled();
    });
});

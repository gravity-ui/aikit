import {observeScrollContent} from '../observeScrollContent';

describe('observeScrollContent', () => {
    const observe = jest.fn();
    const unobserve = jest.fn();
    const disconnect = jest.fn();
    let resize: () => void;
    const OriginalResizeObserver = global.ResizeObserver;

    beforeEach(() => {
        jest.clearAllMocks();
        global.ResizeObserver = jest.fn((callback) => {
            resize = callback;
            return {observe, unobserve, disconnect};
        }) as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
        global.ResizeObserver = OriginalResizeObserver;
    });

    test('notifies when content height or viewport size changes, but ignores unchanged measurements', () => {
        const container = document.createElement('div');
        const content = document.createElement('div');
        container.append(content);
        let contentHeight = 500;
        let viewportHeight = 300;
        Object.defineProperties(container, {
            scrollHeight: {get: () => contentHeight},
            clientHeight: {get: () => viewportHeight},
        });
        const onResize = jest.fn();
        const cleanup = observeScrollContent(container, onResize);
        expect(observe).toHaveBeenCalledWith(container);
        expect(observe).toHaveBeenCalledWith(content);

        resize();
        expect(onResize).not.toHaveBeenCalled();
        contentHeight = 1000;
        resize();
        expect(onResize).toHaveBeenCalledTimes(1);
        resize();
        expect(onResize).toHaveBeenCalledTimes(1);
        viewportHeight = 200;
        resize();
        expect(onResize).toHaveBeenCalledTimes(2);
        cleanup();
        expect(disconnect).toHaveBeenCalled();
    });

    test('tracks replaced content and stops observing after cleanup', async () => {
        const container = document.createElement('div');
        const oldRow = document.createElement('div');
        const newRow = document.createElement('div');
        container.append(oldRow);
        let contentHeight = 500;
        Object.defineProperty(container, 'scrollHeight', {get: () => contentHeight});
        const onResize = jest.fn();
        const cleanup = observeScrollContent(container, onResize);
        container.replaceChildren(newRow);
        await Promise.resolve();
        expect(unobserve).toHaveBeenCalledWith(oldRow);
        expect(observe).toHaveBeenCalledWith(newRow);

        contentHeight = 0;
        container.replaceChildren();
        await Promise.resolve();
        expect(onResize).toHaveBeenCalledTimes(1);

        cleanup();
        observe.mockClear();
        container.append(document.createElement('div'));
        await Promise.resolve();
        expect(observe).not.toHaveBeenCalled();
    });
});

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {TextMessageContent} from '../../types/messages';
import {createMessageRendererRegistry, registerMessageRenderer} from '../messageTypeRegistry';

const TextRenderer = {component: () => null} as const;

describe('registerMessageRenderer', () => {
    const originalEnv = process.env.NODE_ENV;
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        warnSpy.mockRestore();
        process.env.NODE_ENV = originalEnv;
    });

    it('does not warn on first registration in dev', () => {
        process.env.NODE_ENV = 'development';
        const registry = createMessageRendererRegistry();
        registerMessageRenderer<TextMessageContent>(registry, 'text', TextRenderer);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('warns when overwriting an existing renderer in dev', () => {
        process.env.NODE_ENV = 'development';
        const registry = createMessageRendererRegistry();
        registerMessageRenderer<TextMessageContent>(registry, 'text', TextRenderer);
        registerMessageRenderer<TextMessageContent>(registry, 'text', TextRenderer);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0]![0]).toMatch(/overwriting/);
    });

    it('does not warn on overwrite in production', () => {
        process.env.NODE_ENV = 'production';
        const registry = createMessageRendererRegistry();
        registerMessageRenderer<TextMessageContent>(registry, 'text', TextRenderer);
        registerMessageRenderer<TextMessageContent>(registry, 'text', TextRenderer);
        expect(warnSpy).not.toHaveBeenCalled();
    });
});

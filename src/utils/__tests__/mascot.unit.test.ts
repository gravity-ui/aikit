import {getMascotNode, resolveMascotAssets, resolveMascotCollection} from '../mascot';

describe('resolveMascotAssets', () => {
    it('merges themed assets per theme', () => {
        expect(
            resolveMascotAssets(
                {idle: {type: 'themed', light: 'default-light', dark: 'default-dark'}},
                {idle: {type: 'themed', dark: 'override-dark'}},
            ),
        ).toEqual({
            idle: {type: 'themed', light: 'default-light', dark: 'override-dark'},
        });
    });

    it('replaces assets when their variants differ', () => {
        expect(
            resolveMascotAssets(
                {idle: {type: 'themed', light: 'light'}},
                {idle: {type: 'asset', value: 'single'}},
            ),
        ).toEqual({idle: {type: 'asset', value: 'single'}});
    });
});

describe('mascot collections', () => {
    it('merges per surface and state', () => {
        expect(
            resolveMascotCollection(
                {hero: {idle: 'hero-idle'}, chat: {idle: 'chat-idle'}},
                {hero: {reading: 'hero-reading'}, chat: {thinking: 'chat-thinking'}},
            ),
        ).toEqual({
            hero: {idle: 'hero-idle', reading: 'hero-reading'},
            chat: {idle: 'chat-idle', thinking: 'chat-thinking'},
        });
    });

    it('selects a state and falls back to idle on the same surface', () => {
        const mascots = {
            hero: {idle: 'hero-idle'},
            chat: {idle: 'chat-idle', reading: 'chat-reading'},
        };
        expect(getMascotNode(mascots, 'hero', 'reading')).toBe('hero-idle');
        expect(getMascotNode(mascots, 'chat', 'thinking')).toBe('chat-idle');
        expect(getMascotNode(mascots, 'chat', 'reading')).toBe('chat-reading');
    });
});

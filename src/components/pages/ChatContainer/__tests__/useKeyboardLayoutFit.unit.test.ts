import {getIsHeroFitting, resolvePromptInputMaxHeight} from '../useKeyboardLayoutFit';

describe('resolvePromptInputMaxHeight', () => {
    it('should leave the input the space between the header and the rest of the footer', () => {
        // 377 tall chat, 60 of them the header, and a 150 footer holding a 60 tall field: the
        // buttons and the disclaimer below the field take the remaining 90.
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 377,
                headerHeight: 60,
                footerHeight: 150,
                textareaHeight: 60,
            }),
        ).toBe(227);
    });

    it('should keep the same limit once the input has grown', () => {
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 377,
                headerHeight: 60,
                footerHeight: 290,
                textareaHeight: 200,
            }),
        ).toBe(227);
    });

    it('should round the limit down to a whole pixel', () => {
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 376.8,
                headerHeight: 60,
                footerHeight: 150.4,
                textareaHeight: 60,
            }),
        ).toBe(226);
    });

    it('should not go negative when the footer alone fills the chat', () => {
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 200,
                headerHeight: 60,
                footerHeight: 260,
                textareaHeight: 60,
            }),
        ).toBe(0);
    });
});

describe('getIsHeroFitting', () => {
    it('should keep the hero while the welcome screen has room for it', () => {
        expect(getIsHeroFitting({availableHeight: 346, heroHeight: 80})).toBe(true);
    });

    it('should drop the hero once the grown input leaves too little room', () => {
        expect(getIsHeroFitting({availableHeight: 66, heroHeight: 80})).toBe(false);
    });

    it('should keep a hero that fits exactly', () => {
        expect(getIsHeroFitting({availableHeight: 80, heroHeight: 80})).toBe(true);
    });
});

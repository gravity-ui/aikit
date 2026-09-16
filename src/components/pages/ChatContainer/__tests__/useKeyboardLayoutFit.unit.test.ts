import {
    getIsHeroFitting,
    resolveFooterChromeHeight,
    resolvePromptInputMaxHeight,
} from '../useKeyboardLayoutFit';

describe('resolvePromptInputMaxHeight', () => {
    it('should leave the input the space between the header and the rest of the footer', () => {
        // 377 tall chat, 60 of them the header, and 90 taken by the buttons and the disclaimer
        // below the field.
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 377,
                headerHeight: 60,
                footerChromeHeight: 90,
            }),
        ).toBe(227);
    });

    it('should round the limit down to a whole pixel', () => {
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 376.8,
                headerHeight: 60,
                footerChromeHeight: 90.4,
            }),
        ).toBe(226);
    });

    it('should not go negative when the footer alone fills the chat', () => {
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 200,
                headerHeight: 60,
                footerChromeHeight: 200,
            }),
        ).toBe(0);
    });
});

describe('resolveFooterChromeHeight', () => {
    it('should take everything the footer holds besides the field', () => {
        expect(
            resolveFooterChromeHeight({
                footerHeight: 138,
                textareaHeight: 42,
                isFooterSqueezed: false,
            }),
        ).toBe(96);
    });

    it('should stay the same once the field has grown', () => {
        expect(
            resolveFooterChromeHeight({
                footerHeight: 317,
                textareaHeight: 221,
                isFooterSqueezed: false,
                lastChromeHeight: 96,
            }),
        ).toBe(96);
    });

    it('should keep the last height while the field spills out of a squeezed footer', () => {
        // The keyboard came back under a field that grew while it was away: the footer is left
        // with 317 and the field still asks for 322.
        expect(
            resolveFooterChromeHeight({
                footerHeight: 317,
                textareaHeight: 322,
                isFooterSqueezed: true,
                lastChromeHeight: 96,
            }),
        ).toBe(96);
    });

    it('should keep the last height when the footer is squeezed by less than the furniture', () => {
        // The field is shorter than the footer, so the subtraction looks sound - but the footer
        // has already been squeezed out of 39 pixels of its furniture, and taking 57 for it would
        // leave the limit at the height the field already has.
        expect(
            resolveFooterChromeHeight({
                footerHeight: 317,
                textareaHeight: 260,
                isFooterSqueezed: true,
                lastChromeHeight: 96,
            }),
        ).toBe(96);
    });

    it('should ask the caller to measure when there is nothing to remember', () => {
        expect(
            resolveFooterChromeHeight({
                footerHeight: 317,
                textareaHeight: 322,
                isFooterSqueezed: true,
            }),
        ).toBeUndefined();
    });

    it('should not report negative furniture', () => {
        expect(
            resolveFooterChromeHeight({
                footerHeight: 317,
                textareaHeight: 322,
                isFooterSqueezed: false,
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

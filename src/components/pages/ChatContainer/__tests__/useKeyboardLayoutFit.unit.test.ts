import {
    getIsFooterChromeStale,
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

describe('getIsFooterChromeStale', () => {
    it('should measure the furniture when there is none yet', () => {
        expect(getIsFooterChromeStale({footerHeight: 138, textareaHeight: 42})).toBe(true);
    });

    it('should keep the furniture while the footer only reports less of it', () => {
        // The keyboard came back under a field that grew while it was away: the footer is left
        // with 317, the row of buttons spills onto the disclaimer, and the subtraction comes back
        // short - which is the squeeze, not furniture that shrank.
        expect(
            getIsFooterChromeStale({
                footerHeight: 317,
                textareaHeight: 322,
                lastChromeHeight: 96,
            }),
        ).toBe(false);
    });

    it('should keep the furniture while it measures the same', () => {
        expect(
            getIsFooterChromeStale({
                footerHeight: 317,
                textareaHeight: 221,
                lastChromeHeight: 96,
            }),
        ).toBe(false);
    });

    it('should measure again once the furniture has really grown', () => {
        // The disclaimer wrapped onto a second line.
        expect(
            getIsFooterChromeStale({
                footerHeight: 337,
                textareaHeight: 221,
                lastChromeHeight: 96,
            }),
        ).toBe(true);
    });

    it('should not measure again over a fraction of a pixel', () => {
        expect(
            getIsFooterChromeStale({
                footerHeight: 317.6,
                textareaHeight: 221,
                lastChromeHeight: 96,
            }),
        ).toBe(false);
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

describe('resolveFooterChromeHeight', () => {
    it('should take the first measurement as it is', () => {
        expect(resolveFooterChromeHeight({measured: 90})).toEqual({chromeHeight: 90});
    });

    it('should follow the furniture down at once', () => {
        expect(resolveFooterChromeHeight({measured: 60, lastChromeHeight: 90})).toEqual({
            chromeHeight: 60,
        });
    });

    it('should hold the furniture while growth is unconfirmed', () => {
        expect(resolveFooterChromeHeight({measured: 300, lastChromeHeight: 90})).toEqual({
            chromeHeight: 90,
            pendingChromeHeight: 300,
        });
    });

    it('should adopt growth a second measurement agrees with', () => {
        expect(
            resolveFooterChromeHeight({
                measured: 300,
                lastChromeHeight: 90,
                pendingChromeHeight: 300,
            }),
        ).toEqual({chromeHeight: 300, pendingChromeHeight: 300});
    });

    it('should let the limit recover after a spike instead of latching at zero', () => {
        let state = resolveFooterChromeHeight({measured: 90});
        state = resolveFooterChromeHeight({measured: 600, lastChromeHeight: state.chromeHeight});
        state = resolveFooterChromeHeight({
            measured: 600,
            lastChromeHeight: state.chromeHeight,
            pendingChromeHeight: state.pendingChromeHeight,
        });
        expect(state.chromeHeight).toBe(600);

        state = resolveFooterChromeHeight({measured: 90, lastChromeHeight: state.chromeHeight});
        expect(state.chromeHeight).toBe(90);
        expect(
            resolvePromptInputMaxHeight({
                rootHeight: 377,
                headerHeight: 60,
                footerChromeHeight: state.chromeHeight,
            }),
        ).toBe(227);
    });
});

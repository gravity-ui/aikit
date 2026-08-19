import {KEYBOARD_MIN_INSET, resolveKeyboardViewportFit} from '../useKeyboardViewportFit';

describe('resolveKeyboardViewportFit', () => {
    it('should report a closed keyboard when the visual viewport matches the layout one', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 800,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should ignore a shrink smaller than the minimum inset (browser UI, not a keyboard)', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 800 - (KEYBOARD_MIN_INSET - 1),
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should clamp the container to the bottom of the visual viewport', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 460});
    });

    it('should account for the container offset from the top of the layout viewport', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 52,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 408});
    });

    it('should account for a visual viewport scrolled by iOS Safari', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 120,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 580});
    });

    it('should keep the keyboard open while the page is scrolled under it', () => {
        // iOS scrolls the layout viewport to reveal the focused input, which moves `offsetTop`
        // without giving any space back - the keyboard must still be treated as open.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 340,
                scale: 1,
                layoutHeight: 800,
                containerTop: 340,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 460});
    });

    it('should ignore a viewport shrunk by pinch zoom alone', () => {
        // Zooming to 2x halves `visualViewport.height` without any keyboard on screen.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 400,
                viewportOffsetTop: 0,
                scale: 2,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should detect the keyboard while the page is zoomed', () => {
        // iOS Safari zooms into an input with a font size below 16px, so the keyboard has to be
        // detected at a scale above 1 as well: 400 * 1.25 = 500 visible layout pixels out of 800.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 400,
                viewportOffsetTop: 0,
                scale: 1.25,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 400});
    });

    it('should never return a negative height', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 520,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 0});
    });

    it('should round the height down to whole pixels', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 459.6,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 459});
    });

    it('should respect a custom minimum inset', () => {
        expect(
            resolveKeyboardViewportFit(
                {
                    viewportHeight: 780,
                    viewportOffsetTop: 0,
                    scale: 1,
                    layoutHeight: 800,
                    containerTop: 0,
                },
                20,
            ),
        ).toEqual({isKeyboardOpen: true, maxHeight: 780});
    });
});

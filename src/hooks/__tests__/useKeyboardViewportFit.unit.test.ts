import {
    KEYBOARD_MIN_INSET,
    VIEWPORT_HEIGHT_TOLERANCE,
    resolveKeyboardViewportFit,
    resolveViewportOriginTop,
} from '../useKeyboardViewportFit';

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

describe('resolveKeyboardViewportFit with client rectangles in visual viewport coordinates', () => {
    it('should not add the viewport offset a second time', () => {
        // Safari measures client rectangles against the visual viewport, so a container that
        // follows it reports a top of zero while a probe pinned to the layout viewport reports
        // minus the offset. The whole visible area is the container's height budget.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 120,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
                viewportOriginTop: -120,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 460});
    });

    it('should count the part of the container scrolled above the visible area', () => {
        // A container left pinned to the top of the layout viewport starts above the visible area,
        // so it needs that part back to reach the bottom of it.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 120,
                scale: 1,
                layoutHeight: 800,
                containerTop: -120,
                viewportOriginTop: -120,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 580});
    });

    it('should keep the layout viewport reading when the probe stays at the origin', () => {
        // Every other browser measures against the layout viewport, where the probe does not move.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 120,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
                viewportOriginTop: 0,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 580});
    });

    it('should read the layout viewport by default, without a probe', () => {
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
});

describe('resolveKeyboardViewportFit with a measured viewport height', () => {
    it('should treat a shortfall smaller than the tolerance as browser chrome', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 710,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
                measuredViewportHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should not correct away the keyboard itself', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 400,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
                measuredViewportHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 400});
    });

    it('should drive the height limit with the corrected height', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 700,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 1000,
                containerTop: 0,
                measuredViewportHeight: 780,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 780});
    });

    it('should leave a shortfall of exactly the tolerance alone', () => {
        const viewportHeight = 800 - VIEWPORT_HEIGHT_TOLERANCE;

        expect(
            resolveKeyboardViewportFit({
                viewportHeight,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
                measuredViewportHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: viewportHeight});
    });

    it('should not compare a zoomed visual viewport with a measured element', () => {
        // The reported height is in zoomed pixels while a DOM rect is in CSS pixels.
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 400,
                viewportOffsetTop: 0,
                scale: 1.25,
                layoutHeight: 800,
                containerTop: 0,
                measuredViewportHeight: 460,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 400});
    });

    it('should ignore a measured height smaller than the reported one', () => {
        expect(
            resolveKeyboardViewportFit({
                viewportHeight: 460,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
                containerTop: 0,
                measuredViewportHeight: 400,
            }),
        ).toEqual({isKeyboardOpen: true, maxHeight: 460});
    });
});

describe('resolveViewportOriginTop', () => {
    it('should keep a probe sitting at the top of the layout viewport', () => {
        expect(resolveViewportOriginTop({probeTop: 0, viewportOffsetTop: 0})).toBe(0);
    });

    it('should keep a probe reported against the visual viewport', () => {
        // Safari measures client rectangles against the visual viewport, so a probe pinned to the
        // layout viewport comes back at minus its offset.
        expect(resolveViewportOriginTop({probeTop: -48, viewportOffsetTop: 48})).toBe(-48);
    });

    it('should drop a probe that counts from a transformed ancestor', () => {
        // `position: fixed` inside a transformed ancestor counts from that ancestor, and following
        // its offset would push the bottom of the chat under the keyboard.
        expect(resolveViewportOriginTop({probeTop: 120, viewportOffsetTop: 0})).toBe(0);
    });
});

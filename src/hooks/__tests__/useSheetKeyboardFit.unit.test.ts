import {KEYBOARD_MIN_INSET} from '../useKeyboardViewportFit';
import {resolveSheetKeyboardFit} from '../useSheetKeyboardFit';

describe('resolveSheetKeyboardFit', () => {
    it('should report a closed keyboard when the visual viewport matches the layout one', () => {
        expect(
            resolveSheetKeyboardFit({
                viewportHeight: 800,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should ignore a shrink smaller than the minimum inset (browser UI, not a keyboard)', () => {
        expect(
            resolveSheetKeyboardFit({
                viewportHeight: 800 - (KEYBOARD_MIN_INSET - 1),
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should end the sheet where the keyboard starts', () => {
        expect(
            resolveSheetKeyboardFit({
                viewportHeight: 460,
                viewportOffsetTop: 0,
                scale: 1,
                layoutHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: true, visibleBottom: 460, visibleHeight: 460});
    });

    it('should follow a visual viewport panned by iOS Safari', () => {
        expect(
            resolveSheetKeyboardFit({
                viewportHeight: 377,
                viewportOffsetTop: 230,
                scale: 1,
                layoutHeight: 714,
            }),
        ).toEqual({isKeyboardOpen: true, visibleBottom: 607, visibleHeight: 377});
    });

    it('should ignore a viewport shrunk by pinch zoom alone', () => {
        expect(
            resolveSheetKeyboardFit({
                viewportHeight: 400,
                viewportOffsetTop: 0,
                scale: 2,
                layoutHeight: 800,
            }),
        ).toEqual({isKeyboardOpen: false});
    });

    it('should round the geometry down to whole pixels', () => {
        expect(
            resolveSheetKeyboardFit({
                viewportHeight: 376.6,
                viewportOffsetTop: 229.7,
                scale: 1,
                layoutHeight: 714,
            }),
        ).toEqual({isKeyboardOpen: true, visibleBottom: 606, visibleHeight: 376});
    });

    it('should respect a custom minimum inset', () => {
        expect(
            resolveSheetKeyboardFit(
                {
                    viewportHeight: 780,
                    viewportOffsetTop: 0,
                    scale: 1,
                    layoutHeight: 800,
                },
                20,
            ),
        ).toEqual({isKeyboardOpen: true, visibleBottom: 780, visibleHeight: 780});
    });
});

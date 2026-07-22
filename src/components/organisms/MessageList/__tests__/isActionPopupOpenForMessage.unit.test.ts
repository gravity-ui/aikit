import {type PopupState, isActionPopupOpenForMessage} from '../usePopup';

const closedPopup: PopupState = {
    open: false,
    messageId: null,
    actionType: null,
    anchorElement: null,
    content: null,
    title: undefined,
    subtitle: undefined,
    actionConfig: null,
};

describe('isActionPopupOpenForMessage', () => {
    it('returns false when popup is closed', () => {
        expect(isActionPopupOpenForMessage(closedPopup, 'msg-1')).toBe(false);
    });

    it('returns true when popup is open for the message', () => {
        expect(
            isActionPopupOpenForMessage({...closedPopup, open: true, messageId: 'msg-1'}, 'msg-1'),
        ).toBe(true);
    });

    it('returns false when popup is open for a different message', () => {
        expect(
            isActionPopupOpenForMessage({...closedPopup, open: true, messageId: 'msg-2'}, 'msg-1'),
        ).toBe(false);
    });
});

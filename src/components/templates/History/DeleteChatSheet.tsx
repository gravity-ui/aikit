import type {TouchEvent} from 'react';

import {Button, Flex, Sheet, Text, useUniqId} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {i18n} from './i18n';

const b = block('history');

function stopTouchPropagation(event: TouchEvent) {
    event.stopPropagation();
}

interface DeleteChatSheetProps {
    isVisible: boolean;
    isDeleting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteChatSheet({
    isVisible,
    isDeleting,
    onCancel,
    onConfirm,
}: DeleteChatSheetProps) {
    const sheetId = useUniqId();
    const title = i18n('delete-sheet-title');

    return (
        <div
            onTouchStart={stopTouchPropagation}
            onTouchMove={stopTouchPropagation}
            onTouchEnd={stopTouchPropagation}
            onTouchCancel={stopTouchPropagation}
        >
            <Sheet
                id={sheetId}
                title={title}
                visible={isVisible}
                onClose={onCancel}
                contentClassName={b('delete-sheet-content')}
                qa="history-delete-sheet"
            >
                <Flex direction="column" gap={2}>
                    <Text as="div" variant="header-2">
                        {title}
                    </Text>
                    <Text as="div" variant="body-2">
                        {i18n('delete-sheet-message')}
                    </Text>
                </Flex>
                <Flex direction="column" gap={2} spacing={{mt: 5}}>
                    <Button
                        view="outlined-danger"
                        size="xl"
                        width="max"
                        loading={isDeleting}
                        onClick={onConfirm}
                        qa="history-delete-sheet-confirm"
                    >
                        {i18n('tooltip-delete')}
                    </Button>
                    <Button
                        view="flat"
                        size="xl"
                        width="max"
                        disabled={isDeleting}
                        onClick={onCancel}
                        qa="history-delete-sheet-cancel"
                    >
                        {i18n('action-cancel')}
                    </Button>
                </Flex>
            </Sheet>
        </div>
    );
}

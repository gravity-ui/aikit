import React from 'react';

import {Label, QAProps} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

const b = block('context-item');

type ContextItemProps = QAProps & {
    content: React.ReactNode;
    onClick: () => void;
    className?: string;
};

export const ContextItem = (props: ContextItemProps) => {
    const {content, onClick, className, qa} = props;

    return (
        <Label
            size="s"
            theme="clear"
            onCloseClick={onClick}
            type="close"
            className={b(null, className)}
            data-qa={qa}
        >
            {content}
        </Label>
    );
};

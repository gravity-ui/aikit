import React from 'react';

import type {LabelProps} from '@gravity-ui/uikit';
import {Label, QAProps, useMobile} from '@gravity-ui/uikit';

import {useMobileControlSize} from '../../../hooks/useMobileControlSize';
import {block} from '../../../utils/cn';

import './ContextItem.scss';

const b = block('context-item');

type ContextItemProps = QAProps & {
    content: React.ReactNode;
    onClick?: () => void;
    /**
     * Size of the label. Defaults to `s`, or `m` in mobile mode.
     * An explicit size also opts out of the mobile `body-2` typography.
     */
    size?: LabelProps['size'];
    className?: string;
};

export const ContextItem = (props: ContextItemProps) => {
    const {content, onClick, size, className, qa} = props;

    const isMobile = useMobile();
    const isMobileAppearance = isMobile && size === undefined;
    const labelSize = useMobileControlSize(size, 's', 'm');

    return (
        <Label
            size={labelSize}
            theme="clear"
            {...(onClick && {onCloseClick: onClick, type: 'close'})}
            className={b({mobile: isMobileAppearance}, className)}
            data-qa={qa}
        >
            {content}
        </Label>
    );
};

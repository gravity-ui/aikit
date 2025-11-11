import {useMemo} from 'react';

import {CircleExclamationFill, CircleInfoFill, TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Icon, IconData, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Alert.scss';

const b = block('alert');

export interface AlertProps {
    text: string;
    variant?: 'default' | 'warning' | 'error' | 'info';
    icon?: React.ReactNode;
    button?: {
        content: React.ReactNode;
        onClick: () => void;
    };
    className?: string;
    qa?: string;
}

const statusIcons: Record<string, IconData> = {
    info: CircleInfoFill,
    warning: TriangleExclamationFill,
    error: CircleExclamationFill,
};

export function Alert({text, icon, button, variant = 'default', className, qa}: AlertProps) {
    const statusIcon = useMemo(() => {
        if (icon) {
            return <div className={b('icon')}>{icon}</div>;
        }
        const iconData = variant ? statusIcons[variant] : null;

        if (iconData) {
            return <Icon data={iconData} size={14} className={b('icon', {variant})} />;
        }
        return null;
    }, [icon, variant]);

    return (
        <div className={b(null, className)} data-qa={qa}>
            {statusIcon}
            <Text variant="body-1">{text}</Text>
            {button ? (
                <Button onClick={button.onClick} size="s" view="outlined" className={b('action')}>
                    {button.content}
                </Button>
            ) : null}
        </div>
    );
}

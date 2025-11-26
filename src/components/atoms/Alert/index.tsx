import {useMemo, useState} from 'react';

import {
    ChevronDown,
    ChevronUp,
    CircleExclamationFill,
    CircleInfoFill,
    TriangleExclamationFill,
} from '@gravity-ui/icons';
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
    content?: React.ReactNode;
    initialExpanded?: boolean;
    className?: string;
    qa?: string;
}

const statusIcons: Record<string, IconData> = {
    info: CircleInfoFill,
    warning: TriangleExclamationFill,
    error: CircleExclamationFill,
};

export function Alert({
    text,
    icon,
    button,
    content,
    initialExpanded = false,
    variant = 'default',
    className,
    qa,
}: AlertProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

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

    const toggleExpanded = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className={b(null, className)} data-qa={qa}>
            <div className={b('header')}>
                {statusIcon}
                <Text variant="body-1" className={b('text')}>
                    {text}
                </Text>
                {content && (
                    <Button
                        onClick={toggleExpanded}
                        size="s"
                        view="flat"
                        className={b('collapse-button')}
                    >
                        <Icon data={isExpanded ? ChevronUp : ChevronDown} size={16} />
                    </Button>
                )}
                {button ? (
                    <Button
                        onClick={button.onClick}
                        size="s"
                        view="outlined"
                        className={b('action')}
                    >
                        {button.content}
                    </Button>
                ) : null}
            </div>
            {content && isExpanded && <div className={b('content')}>{content}</div>}
        </div>
    );
}

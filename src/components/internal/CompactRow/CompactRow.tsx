import {type ReactNode, useContext} from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Icon, Tooltip} from '@gravity-ui/uikit';

import {LayoutChangeContext} from '../../../utils/chatLayoutChange';
import {block} from '../../../utils/cn';
import {Shimmer} from '../../atoms/Shimmer';

import './CompactRow.scss';

const b = block('compact-row');

export function CompactRow({
    label,
    icon,
    showIcon = true,
    context,
    active,
    expanded,
    onToggle,
    children,
    tooltip,
    persistentChevron = false,
    secondary = false,
    secondaryIcons = false,
}: {
    tooltip?: ReactNode;
    persistentChevron?: boolean;
    secondary?: boolean;
    secondaryIcons?: boolean;
    label: ReactNode;
    icon?: ReactNode;
    showIcon?: boolean;
    context?: ReactNode;
    active?: boolean;
    expanded: boolean;
    onToggle?: () => void;
    children?: ReactNode;
}) {
    const preserve = useContext(LayoutChangeContext);
    const Heading = onToggle ? 'button' : 'div';
    return (
        <div className={b({'without-icon': !showIcon})}>
            <Tooltip placement="top" content={tooltip} disabled={!tooltip}>
                <Heading
                    type={onToggle ? 'button' : undefined}
                    className={b('toggle', {
                        persistent: persistentChevron,
                        secondary,
                        'secondary-icons': secondaryIcons,
                    })}
                    aria-label={typeof label === 'string' ? label : undefined}
                    aria-expanded={onToggle ? expanded : undefined}
                    onClick={onToggle ? () => preserve(onToggle) : undefined}
                >
                    {showIcon && (
                        <span className={b('icon')} aria-hidden="true">
                            {icon}
                        </span>
                    )}
                    {active ? <Shimmer>{label}</Shimmer> : <span>{label}</span>}
                    {context && <span className={b('context')}>{context}</span>}
                    {onToggle && (
                        <Icon
                            data={ChevronRight}
                            size={12}
                            className={expanded ? 'expanded' : ''}
                        />
                    )}
                </Heading>
            </Tooltip>
            <div hidden={!expanded} className={b('detail')}>
                {children}
            </div>
        </div>
    );
}

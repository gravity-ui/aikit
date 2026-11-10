import {type ReactNode, useContext} from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Icon, Tooltip} from '@gravity-ui/uikit';

import {LayoutChangeContext} from '../../../utils/chatLayoutChange';
import {Shimmer} from '../../atoms/Shimmer';

import './CompactRow.scss';

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
}: {
    tooltip?: ReactNode;
    persistentChevron?: boolean;
    label: ReactNode;
    icon?: ReactNode;
    showIcon?: boolean;
    context?: ReactNode;
    active?: boolean;
    expanded: boolean;
    onToggle: () => void;
    children?: ReactNode;
}) {
    const preserve = useContext(LayoutChangeContext);
    return (
        <div
            className={`g-aikit-compact-row ${showIcon ? '' : 'g-aikit-compact-row_without-icon'}`}
        >
            <Tooltip placement="top" content={tooltip} disabled={!tooltip}>
                <button
                    type="button"
                    className={`g-aikit-compact-row__toggle ${persistentChevron ? 'g-aikit-compact-row__toggle_persistent' : ''}`}
                    aria-label={typeof label === 'string' ? label : undefined}
                    aria-expanded={expanded}
                    onClick={() => preserve(onToggle)}
                >
                    {showIcon && (
                        <span className="g-aikit-compact-row__icon" aria-hidden="true">
                            {icon}
                        </span>
                    )}
                    {active ? <Shimmer>{label}</Shimmer> : <span>{label}</span>}
                    {context && <span className="g-aikit-compact-row__context">{context}</span>}
                    <Icon data={ChevronRight} size={12} className={expanded ? 'expanded' : ''} />
                </button>
            </Tooltip>
            <div hidden={!expanded} className="g-aikit-compact-row__detail">
                {children}
            </div>
        </div>
    );
}

'use client';

import React, {useCallback} from 'react';

import {DOMProps, Label, QAProps} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Tabs.scss';

const b = block('tabs');

export type TabsProps = QAProps &
    DOMProps & {
        items: {
            id: string;
            title: string;
            icon?: React.ReactNode;
        }[];
        activeId?: string;
        onSelectItem?: (id: string) => void;
        onDeleteItem?: (id: string) => Promise<void>;
        allowDelete?: boolean;
    };

export const Tabs = (props: TabsProps) => {
    const {
        items,
        activeId,
        onSelectItem,
        onDeleteItem,
        allowDelete = false,
        className,
        style,
        qa,
    } = props;

    const handleTabClick = useCallback(
        (id: string) => {
            if (onSelectItem) {
                onSelectItem(id);
            }
        },
        [onSelectItem],
    );

    const handleDeleteClick = useCallback(
        (id: string) => {
            if (onDeleteItem) {
                onDeleteItem(id);
            }
        },
        [onDeleteItem],
    );

    return (
        <div className={b(null, className)} style={style} data-qa={qa}>
            {items.map((item) => {
                const isActive = item.id === activeId;
                return (
                    <Label
                        key={item.id}
                        size="s"
                        theme={isActive ? 'info' : 'clear'}
                        interactive
                        onClick={() => handleTabClick(item.id)}
                        type={allowDelete ? 'close' : 'default'}
                        onCloseClick={allowDelete ? () => handleDeleteClick(item.id) : undefined}
                        icon={item.icon}
                        className={b('tab', {active: isActive})}
                        data-qa={`${qa}-tab-${item.id}`}
                    >
                        {item.title}
                    </Label>
                );
            })}
        </div>
    );
};

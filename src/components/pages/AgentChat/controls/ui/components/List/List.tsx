import {type CSSProperties, type PropsWithChildren, type Ref} from 'react';

import {List as GList, type ListProps, Text} from '@gravity-ui/uikit';

import {cn as cn, i18n as i18nGlobal} from '../../../adapters';

import './List.ported.scss';
const css = {
    wrapper: 'agent-ui-components-List-List-module-css-wrapper',
    count: 'agent-ui-components-List-List-module-css-count',
};

export interface IListProps<Item> extends ListProps<Item> {
    containerRef?: Ref<HTMLDivElement>;
    containerStyle?: CSSProperties;
}

export function List<Item>(props: IListProps<Item>) {
    const {containerRef, containerStyle, className, ...listProps} = props;

    const list = props.items.length ? (
        <GList {...listProps} className={cn(css.wrapper, className)} />
    ) : (
        <Text color="secondary">{i18nGlobal('nothing-found')}</Text>
    );

    if (!containerRef && !containerStyle) {
        return list;
    }

    return (
        <div ref={containerRef} style={containerStyle}>
            {list}
        </div>
    );
}

interface IItemsCountProps {
    className?: string;
}

List.ItemsCount = function ItemsCount(props: PropsWithChildren<IItemsCountProps>) {
    return (
        <div className={cn(css.count, props.className)}>
            <Text color="secondary">{props.children}</Text>
        </div>
    );
};

import React, {forwardRef} from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {
    Button,
    type ButtonProps,
    SegmentedRadioGroup,
    type SegmentedRadioGroupProps,
    Text,
    TextInput,
    type TextInputProps,
    type TextProps,
} from '@gravity-ui/uikit';
import {Icon} from '@gravity-ui/uikit';

import {cn as cn, i18n} from '../../../adapters';
import {ListItem} from '../ListItem/index';

import './SelectPopup.ported.scss';
const DebounceTextInput = TextInput;

const css = {
    wrapper: 'agent-ui-components-SelectPopup-SelectPopup-module-css-wrapper',
    header: 'agent-ui-components-SelectPopup-SelectPopup-module-css-header',
    filter: 'agent-ui-components-SelectPopup-SelectPopup-module-css-filter',
    list: 'agent-ui-components-SelectPopup-SelectPopup-module-css-list',
    footer: 'agent-ui-components-SelectPopup-SelectPopup-module-css-footer',
    search: 'agent-ui-components-SelectPopup-SelectPopup-module-css-search',
    searchIcon: 'agent-ui-components-SelectPopup-SelectPopup-module-css-searchIcon',
    emptyOptions: 'agent-ui-components-SelectPopup-SelectPopup-module-css-emptyOptions',
    listCount: 'agent-ui-components-SelectPopup-SelectPopup-module-css-listCount',
};

export function SelectPopup(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn(css.wrapper, props.className)} />;
}

SelectPopup.Header = function SelectPopupHeader(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn(css.header, props.className)} />;
};

SelectPopup.Filter = function SelectPopupFilter(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn(css.filter, props.className)} />;
};

SelectPopup.Tabs = function SelectPopupTabs(props: SegmentedRadioGroupProps) {
    return <SegmentedRadioGroup size="m" width="max" {...props} />;
};

SelectPopup.Tab = SegmentedRadioGroup.Option;

SelectPopup.List = function SelectPopupList(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn(css.list, props.className)} />;
};

SelectPopup.ListCount = function SelectPopupListCount({
    count,
    color = 'secondary',
    ...props
}: TextProps & {count: number}) {
    return (
        <Text {...props} color={color} className={cn(css.listCount, props.className)}>
            {i18n('items-found', {items: count})}
        </Text>
    );
};

SelectPopup.Footer = function SelectPopupFooter(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn(css.footer, props.className)} />;
};

SelectPopup.FooterButton = function SelectPopupFooterButton(props: ButtonProps) {
    return <Button view="normal" size="m" width="max" {...props} />;
};

SelectPopup.Search = forwardRef<
    HTMLInputElement,
    TextInputProps & {
        debounced?: boolean;
    }
>(function SelectPopupSearch({debounced, ...props}, ref) {
    const Component = debounced ? DebounceTextInput : TextInput;

    return (
        <Component
            startContent={
                <div className={css.searchIcon}>
                    <Icon data={Magnifier} size={16} />
                </div>
            }
            {...props}
            placeholder={i18n('search')}
            className={cn(css.search, props.className)}
            ref={ref}
        />
    );
});

SelectPopup.ListItem = ListItem;

SelectPopup.EmptyOptions = function SelectPopupEmptyOptions({
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div {...props} className={cn(css.emptyOptions, props.className)}>
            {children ?? (
                <SelectPopup.EmptyPlaceholder>{i18n('nothing-found')}</SelectPopup.EmptyPlaceholder>
            )}
        </div>
    );
};

SelectPopup.EmptyPlaceholder = function SelectPopupEmptyOptions({
    color = 'secondary',
    ...props
}: React.PropsWithChildren<TextProps>) {
    return <Text {...props} color={color} />;
};

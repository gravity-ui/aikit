import React, {type PropsWithChildren, type RefAttributes, forwardRef} from 'react';

import {Icon, type IconProps, Text, type TextProps} from '@gravity-ui/uikit';

import {cn as cn} from '../../../adapters';

import './ListItem.ported.scss';
const css = {
    wrapper: 'agent-ui-components-ListItem-ListItem-module-css-wrapper',
    interactive: 'agent-ui-components-ListItem-ListItem-module-css-interactive',
    active: 'agent-ui-components-ListItem-ListItem-module-css-active',
    title: 'agent-ui-components-ListItem-ListItem-module-css-title',
    subtitle: 'agent-ui-components-ListItem-ListItem-module-css-subtitle',
    disabled: 'agent-ui-components-ListItem-ListItem-module-css-disabled',
    avatar: 'agent-ui-components-ListItem-ListItem-module-css-avatar',
    content: 'agent-ui-components-ListItem-ListItem-module-css-content',
    startIcon: 'agent-ui-components-ListItem-ListItem-module-css-startIcon',
    endContent: 'agent-ui-components-ListItem-ListItem-module-css-endContent',
};

export type TListItemProps = RefAttributes<HTMLDivElement> &
    PropsWithChildren<{
        className?: string;
        active?: boolean;
        disabled?: boolean;
        interactive?: boolean;
        qa?: string;
    }>;

type TDivProps = React.HTMLAttributes<HTMLDivElement>;

type TTextProps = PropsWithChildren<Omit<TextProps, 'variant' | 'color'>>;

export interface IListComponent extends React.ForwardRefExoticComponent<TListItemProps> {
    Title: typeof Title;
    Subtitle: typeof Subtitle;
    Content: typeof Content;
    StartIcon: typeof StartIcon;
    EndContent: typeof EndContent;
}

export const ListItem = forwardRef<HTMLDivElement, TListItemProps>((props, ref) => {
    const {active = false, disabled = false, interactive = true, className, children, qa} = props;

    return (
        <div
            ref={ref}
            data-qa={qa}
            className={cn(
                css.wrapper,
                {[css.active]: active, [css.disabled]: disabled, [css.interactive]: interactive},
                className,
            )}
        >
            {children}
        </div>
    );
}) as IListComponent;

ListItem.displayName = 'ListItem';

function Title(props: TTextProps) {
    return (
        <Text {...props} ellipsis className={cn(css.title, props.className)} variant="body-short" />
    );
}

function Subtitle(props: TTextProps) {
    return (
        <Text
            {...props}
            ellipsis
            className={cn(css.subtitle, props.className)}
            variant="body-short"
        />
    );
}

function Content(props: TDivProps) {
    return <div {...props} className={cn(css.content, props.className)} />;
}

function StartIcon({className, ...props}: IconProps) {
    return (
        <div className={cn(css.startIcon, className)}>
            <Icon {...props} />
        </div>
    );
}

const EndContent = function EndContent(props: TDivProps) {
    return <div {...props} className={cn(css.endContent, props.className)} />;
};

ListItem.Title = Title;
ListItem.Subtitle = Subtitle;
ListItem.Content = Content;
ListItem.StartIcon = StartIcon;
ListItem.EndContent = EndContent;

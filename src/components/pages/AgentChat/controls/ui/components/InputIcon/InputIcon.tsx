import {Icon, type IconProps} from '@gravity-ui/uikit';

import {cn} from '../../../classNames';

import './InputIcon.ported.scss';
const css = {
    wrapper: 'g-aikit-agent-input-icon__wrapper',
    start: 'g-aikit-agent-input-icon__start',
    end: 'g-aikit-agent-input-icon__end',
};

export const InputIcon = (props: IconProps) => (
    <Icon {...props} size={16} className={cn(css.wrapper, props.className)} />
);

const Start = (props: IconProps) => (
    <InputIcon {...props} className={cn(css.start, props.className)} />
);

const End = (props: IconProps) => <InputIcon {...props} className={cn(css.end, props.className)} />;

InputIcon.Start = Start;
InputIcon.End = End;

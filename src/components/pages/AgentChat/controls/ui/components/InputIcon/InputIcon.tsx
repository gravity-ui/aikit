import {Icon, type IconProps} from '@gravity-ui/uikit';

import {cn as cn} from '../../../adapters';

import './InputIcon.ported.scss';
const css = {
    wrapper: 'agent-ui-components-InputIcon-InputIcon-module-css-wrapper',
    start: 'agent-ui-components-InputIcon-InputIcon-module-css-start',
    end: 'agent-ui-components-InputIcon-InputIcon-module-css-end',
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

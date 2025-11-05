import {Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './Disclaimer.scss';

/**
 * Props for the Disclaimer component
 */
export type DisclaimerProps = React.PropsWithChildren<{
    /** Additional CSS class */
    className?: string;
    /** Disclaimer text to display */
    text?: string;
    /** QA/test identifier */
    qa?: string;
}>;

const b = block('disclaimer');

/**
 * Disclaimer component displays informational or warning messages
 *
 * @param props - Component props
 * @returns React component
 */
export function Disclaimer(props: DisclaimerProps) {
    const {className, qa, children, text} = props;

    return (
        <div className={b('container', className)} data-qa={qa}>
            {text && <Text color="secondary">{text}</Text>}
            {children}
        </div>
    );
}

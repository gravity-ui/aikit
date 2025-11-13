import {ReactNode} from 'react';

import {block} from '../../../utils/cn';

import './PromptInputPanel.scss';

const b = block('prompt-input-panel');

/**
 * Props for the PromptInputPanel component
 */
export type PromptInputPanelProps = {
    /** Panel content */
    children?: ReactNode;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputPanel component displays a panel with custom content
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputPanel(props: PromptInputPanelProps) {
    const {children, className, qa} = props;

    return (
        <div className={b(null, className)} data-qa={qa}>
            {children}
        </div>
    );
}

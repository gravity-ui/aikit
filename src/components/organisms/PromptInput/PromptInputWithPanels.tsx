import {ReactNode} from 'react';

import {block} from '../../../utils/cn';
import {PromptInputPanel} from '../../molecules/PromptInputPanel';

import {PromptInputPanelConfig} from './types';
import {useDelayedUnmount} from './useDelayedUnmount';

const b = block('prompt-input');

/**
 * Props for the PromptInputWithPanels component
 */
export type PromptInputWithPanelsProps = {
    /** Child component (PromptInput view) */
    children: ReactNode;
    /** Top panel configuration */
    topPanel?: PromptInputPanelConfig;
    /** Bottom panel configuration */
    bottomPanel?: PromptInputPanelConfig;
    /** Additional CSS class */
    className?: string;
    /** QA/test identifier */
    qa?: string;
};

/**
 * PromptInputWithPanels component - wrapper that shows expandable panels around the prompt input
 *
 * @param props - Component props
 * @returns React component
 */
export function PromptInputWithPanels(props: PromptInputWithPanelsProps) {
    const {children, topPanel, bottomPanel, className, qa} = props;

    // Use hook to delay unmounting for animation
    const shouldRenderTopPanel = useDelayedUnmount(topPanel?.isOpen ?? false, 300);
    const shouldRenderBottomPanel = useDelayedUnmount(bottomPanel?.isOpen ?? false, 300);

    return (
        <div className={b('panel-wrapper', className)} data-qa={qa}>
            {topPanel && shouldRenderTopPanel && (
                <div className={b('panel', {position: 'top', open: topPanel.isOpen})}>
                    <PromptInputPanel>{topPanel.children}</PromptInputPanel>
                </div>
            )}

            {children}

            {bottomPanel && shouldRenderBottomPanel && (
                <div className={b('panel', {position: 'bottom', open: bottomPanel.isOpen})}>
                    <PromptInputPanel>{bottomPanel.children}</PromptInputPanel>
                </div>
            )}
        </div>
    );
}

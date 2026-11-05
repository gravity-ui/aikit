import {ArrowDown, Hand} from '@gravity-ui/icons';
import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';

import {ScrollToBottomButton} from './ScrollToBottomButton';

it('switches approval to streaming to completion while preserving the down arrow', () => {
    const reference = render(
        <>
            <ArrowDown />
            <Hand />
        </>,
    );
    const [arrow, hand] = Array.from(reference.container.querySelectorAll('svg')).map(
        (svg) => svg.innerHTML,
    );
    reference.unmount();
    const {rerender} = render(<ScrollToBottomButton waitingForApproval streaming />);
    const button = screen.getByRole('button', {name: 'Scroll to bottom'});
    const activity = () => button.querySelector('.g-aikit-scroll-to-bottom-button__activity');
    const arrowIcon = () => button.querySelector('.g-aikit-scroll-to-bottom-button__arrow svg svg');
    expect(activity()?.querySelector('svg svg')?.innerHTML).toBe(hand);
    expect(arrowIcon()?.innerHTML).toBe(arrow);

    rerender(<ScrollToBottomButton streaming />);
    expect(activity()?.querySelector('svg')).toBeNull();
    expect(activity()?.children).toHaveLength(3);
    expect(arrowIcon()?.innerHTML).toBe(arrow);

    rerender(<ScrollToBottomButton />);
    expect(activity()).toBeNull();
    expect(button).not.toHaveClass('g-aikit-scroll-to-bottom-button_streaming');
    expect(arrowIcon()?.innerHTML).toBe(arrow);
});

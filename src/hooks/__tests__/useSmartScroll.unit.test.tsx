import {act, render} from '@testing-library/react';

import type {ChatStatus} from '../../types';
import {type UseSmartScrollReturn, useSmartScroll} from '../useSmartScroll';

type HarnessProps = {
    messagesCount: number;
    status?: ChatStatus;
    isStreaming?: boolean;
    autoScroll?: boolean;
};

let hookResult: UseSmartScrollReturn<HTMLDivElement>;

function Harness(props: HarnessProps) {
    const result = useSmartScroll<HTMLDivElement>(props);
    hookResult = result;
    return <div ref={result.containerRef} />;
}

const mutateContainer = async () => {
    await act(async () => {
        hookResult.containerRef.current?.appendChild(document.createTextNode('token'));
        // MutationObserver callbacks are queued as microtasks.
        await Promise.resolve();
    });
};

describe('useSmartScroll', () => {
    let scrollTo: jest.Mock;

    beforeEach(() => {
        scrollTo = jest.fn();
        Element.prototype.scrollTo = scrollTo;
    });

    it('should scroll to the bottom on mount by default', () => {
        render(<Harness messagesCount={1} />);
        expect(scrollTo).toHaveBeenCalledWith({top: expect.any(Number), behavior: 'instant'});
    });

    it('should not scroll on mount when auto-scroll is disabled', () => {
        render(<Harness messagesCount={1} autoScroll={false} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should scroll when a message is appended', () => {
        const {rerender} = render(<Harness messagesCount={1} />);
        scrollTo.mockClear();
        rerender(<Harness messagesCount={2} />);
        expect(scrollTo).toHaveBeenCalledWith({top: expect.any(Number), behavior: 'smooth'});
    });

    it('should not scroll on a new message when auto-scroll is disabled', () => {
        const {rerender} = render(<Harness messagesCount={1} autoScroll={false} />);
        scrollTo.mockClear();
        rerender(<Harness messagesCount={2} autoScroll={false} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should scroll on a status change', () => {
        const {rerender} = render(<Harness messagesCount={1} status="submitted" />);
        scrollTo.mockClear();
        rerender(<Harness messagesCount={1} status="ready" />);
        expect(scrollTo).toHaveBeenCalledWith({top: expect.any(Number), behavior: 'smooth'});
    });

    it('should not scroll on a status change when auto-scroll is disabled', () => {
        const {rerender} = render(
            <Harness messagesCount={1} status="submitted" autoScroll={false} />,
        );
        scrollTo.mockClear();
        rerender(<Harness messagesCount={1} status="ready" autoScroll={false} />);
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should scroll when the DOM mutates while streaming', async () => {
        render(<Harness messagesCount={1} status="streaming" isStreaming />);
        scrollTo.mockClear();
        await mutateContainer();
        expect(scrollTo).toHaveBeenCalledWith({top: expect.any(Number), behavior: 'instant'});
    });

    it('should not scroll on a streaming mutation when auto-scroll is disabled', async () => {
        render(<Harness messagesCount={1} status="streaming" isStreaming autoScroll={false} />);
        scrollTo.mockClear();
        await mutateContainer();
        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should keep the imperative scrollToBottom working while auto-scroll is disabled', () => {
        render(<Harness messagesCount={1} autoScroll={false} />);
        expect(scrollTo).not.toHaveBeenCalled();

        hookResult.scrollToBottom();

        expect(scrollTo).toHaveBeenCalledTimes(1);
    });

    it('should keep tracking user scroll while auto-scroll is disabled', () => {
        render(<Harness messagesCount={1} autoScroll={false} />);
        const container = hookResult.containerRef.current as HTMLDivElement;
        Object.defineProperty(container, 'scrollHeight', {value: 1000, configurable: true});
        Object.defineProperty(container, 'clientHeight', {value: 100, configurable: true});
        container.scrollTop = 200;

        act(() => {
            container.dispatchEvent(new Event('scroll'));
        });

        // distanceFromBottom = 1000 - 200 - 100 = 700, well past SCROLL_THRESHOLD, so the listener
        // must have recorded the scroll-up - which the imperative scrollToBottom then respects.
        hookResult.scrollToBottom();

        expect(scrollTo).not.toHaveBeenCalled();
    });

    it('should not scroll when only auto-scroll flips from disabled to enabled', () => {
        // No other prop changes here (status/messagesCount stay put), so if autoScroll were ever
        // added to an effect's dependency array, that effect would spuriously re-fire on this
        // transition and - since the ref is already updated by the time effects run - the call
        // would go through uninhibited, unlike the disable direction where the ref masks it.
        const {rerender} = render(<Harness messagesCount={1} status="ready" autoScroll={false} />);
        scrollTo.mockClear();
        rerender(<Harness messagesCount={1} status="ready" autoScroll />);
        expect(scrollTo).not.toHaveBeenCalled();
    });
});

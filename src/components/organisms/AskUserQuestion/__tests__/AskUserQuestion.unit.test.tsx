import {ThemeProvider, configure} from '@gravity-ui/uikit';
import '@testing-library/jest-dom';
import {act, render, screen, waitFor} from '@testing-library/react';

import {AskUserQuestion} from '..';
import type {AskUserQuestionProps} from '..';

const originalResizeObserver = global.ResizeObserver;
const originalMatchMedia = window.matchMedia;
const originalGetAnimations = Object.getOwnPropertyDescriptor(Element.prototype, 'getAnimations');
const getAnimations = jest.fn<Array<{finished: Promise<void>}>, []>();

beforeAll(() => {
    configure({lang: 'en'});
    global.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
    Object.defineProperty(Element.prototype, 'getAnimations', {
        configurable: true,
        value: getAnimations,
    });
});
beforeEach(() => {
    getAnimations.mockReset().mockReturnValue([]);
    window.matchMedia = jest.fn().mockReturnValue({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
    });
});
afterAll(() => {
    global.ResizeObserver = originalResizeObserver;
    window.matchMedia = originalMatchMedia;
    if (originalGetAnimations) {
        Object.defineProperty(Element.prototype, 'getAnimations', originalGetAnimations);
    } else {
        Reflect.deleteProperty(Element.prototype, 'getAnimations');
    }
});

function Card(props: Partial<AskUserQuestionProps>) {
    return (
        <ThemeProvider>
            <AskUserQuestion
                question="Which scope should we use?"
                options={[{id: 'shared', title: 'Shared'}]}
                onAnswer={jest.fn()}
                questionCount={2}
                {...props}
            />
        </ThemeProvider>
    );
}

it('waits for every progress animation before completing with the latest callback', async () => {
    let finishFirst = () => {};
    let finishLast = () => {};
    const first = new Promise<void>((resolve) => {
        finishFirst = resolve;
    });
    const last = new Promise<void>((resolve) => {
        finishLast = resolve;
    });
    getAnimations.mockReturnValue([{finished: first}, {finished: last}]);
    const originalCallback = jest.fn();
    const latestCallback = jest.fn();
    const {rerender} = render(
        <Card answeredQuestionIndices={[0]} onProgressComplete={originalCallback} />,
    );
    rerender(<Card answeredQuestionIndices={[0, 1]} onProgressComplete={originalCallback} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    rerender(<Card answeredQuestionIndices={[0, 1]} onProgressComplete={latestCallback} />);
    await act(async () => {
        finishFirst();
        await first;
    });
    expect(latestCallback).not.toHaveBeenCalled();
    await act(async () => {
        finishLast();
        await last;
    });
    expect(latestCallback).toHaveBeenCalledTimes(1);
    expect(originalCallback).not.toHaveBeenCalled();
});

it('completes without a timer when reduced motion leaves no animations', async () => {
    window.matchMedia = jest.fn().mockReturnValue({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
    });
    const complete = jest.fn();
    render(<Card answeredQuestionIndices={[0, 1]} onProgressComplete={complete} />);
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1));
});

it.each(['incomplete', 'unmounted'])('cancels pending completion when %s', async (state) => {
    let finish = () => {};
    const finished = new Promise<void>((resolve) => {
        finish = resolve;
    });
    getAnimations.mockReturnValue([{finished}]);
    const complete = jest.fn();
    const {rerender, unmount} = render(
        <Card answeredQuestionIndices={[0, 1]} onProgressComplete={complete} />,
    );
    if (state === 'incomplete') {
        rerender(<Card answeredQuestionIndices={[0]} onProgressComplete={complete} />);
    } else {
        unmount();
    }
    await act(async () => {
        finish();
        await finished;
    });
    expect(complete).not.toHaveBeenCalled();
});

it('excludes duplicate and invalid indices and does not complete single-question progress', async () => {
    const complete = jest.fn();
    const {rerender} = render(
        <Card answeredQuestionIndices={[0, 0, -1, 2, 0.5]} onProgressComplete={complete} />,
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    rerender(
        <Card questionCount={1} answeredQuestionIndices={[0]} onProgressComplete={complete} />,
    );
    await act(async () => {});
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(complete).not.toHaveBeenCalled();
});

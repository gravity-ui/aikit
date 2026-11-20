import {useState} from 'react';

import {ThemeProvider, configure} from '@gravity-ui/uikit';
import '@testing-library/jest-dom';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';

import {AskUserQuestion} from '..';
import type {AskUserQuestionAnswer, AskUserQuestionProps} from '..';

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

it('confirms, edits and restores a controlled custom answer without submitting on Escape', () => {
    const onAnswer = jest.fn();
    const onClose = jest.fn();
    function ControlledCard() {
        const [answer, setAnswer] = useState<AskUserQuestionAnswer>();
        const [customAnswer, setCustomAnswer] = useState('');
        return (
            <Card
                selectedAnswer={answer}
                customAnswer={customAnswer}
                onCustomAnswerChange={setCustomAnswer}
                onClose={onClose}
                onAnswer={(next) => {
                    setAnswer(next);
                    onAnswer(next);
                }}
            />
        );
    }
    render(<ControlledCard />);
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '  First answer  '}});
    fireEvent.click(screen.getByRole('button', {name: 'Confirm'}));
    expect(onAnswer).toHaveBeenLastCalledWith({type: 'custom', value: 'First answer'});
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('First answer');
    fireEvent.change(input, {target: {value: 'Second answer'}});
    fireEvent.keyDown(input, {key: 'Enter', isComposing: true});
    expect(onAnswer).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onAnswer).toHaveBeenLastCalledWith({type: 'custom', value: 'Second answer'});
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Discard'}});
    fireEvent.keyDown(screen.getByRole('textbox'), {key: 'Escape'});
    expect(screen.getByText('Second answer')).toBeVisible();
    expect(onAnswer).toHaveBeenCalledTimes(2);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    expect(screen.getByRole('textbox')).toHaveValue('Second answer');
});

it('keeps unsubmitted edits separate across questions and honours controlled answer changes', () => {
    const {rerender} = render(<Card selectedAnswer={{type: 'custom', value: 'Saved'}} />);
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Unsaved'}});
    rerender(<Card question="Another question" questionIndex={1} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
    rerender(<Card selectedAnswer={{type: 'custom', value: 'Saved'}} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeVisible();
    rerender(<Card selectedAnswer={{type: 'custom', value: 'External update'}} />);
    expect(screen.getByText('External update')).toBeVisible();
});

it('supports the custom answer edit cycle without controlled props', () => {
    render(<Card />);
    fireEvent.change(screen.getByRole('textbox'), {target: {value: 'Saved locally'}});
    fireEvent.keyDown(screen.getByRole('textbox'), {key: 'Enter'});
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Edit'}));
    expect(screen.getByRole('textbox')).toHaveValue('Saved locally');
});

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

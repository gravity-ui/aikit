import {type CSSProperties, type ReactNode, useEffect, useRef, useState} from 'react';

import {useLayoutEffect} from '@gravity-ui/uikit';

import './ComposerQuestionTransition.scss';

/** Keeps the composer mounted while the host temporarily replaces it with a question. */
export function ComposerQuestionTransition({
    question,
    composer,
}: {
    question?: ReactNode;
    composer: ReactNode;
}) {
    const active = Boolean(question);
    const composerRef = useRef<HTMLDivElement>(null);
    const questionRef = useRef<HTMLDivElement>(null);
    const previousQuestion = useRef<ReactNode>();
    const previousActive = useRef(active);
    const [moving, setMoving] = useState(false);
    const [height, setHeight] = useState<number>();

    useLayoutEffect(() => {
        setMoving(true);
        const timer = setTimeout(() => setMoving(false), 240);
        return () => clearTimeout(timer);
    }, [active]);

    useLayoutEffect(() => {
        if (question) {
            previousQuestion.current = question;
        }
        const composerElement = composerRef.current;
        const questionElement = questionRef.current;
        if (composerElement) {
            composerElement.inert = active;
        }
        if (questionElement) {
            questionElement.inert = !active;
        }
        const element = active ? questionElement : composerElement;
        const measure = () => setHeight(element?.getBoundingClientRect().height);
        measure();
        const observer = new ResizeObserver(measure);
        if (element) {
            observer.observe(element);
        }
        return () => observer.disconnect();
    }, [active, question]);

    useEffect(() => {
        if (previousActive.current === active) {
            return undefined;
        }
        previousActive.current = active;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timer = setTimeout(
            () => {
                const element = active ? questionRef.current : composerRef.current;
                element
                    ?.querySelector<HTMLElement>(active ? '[data-question-answer]' : 'textarea')
                    ?.focus({preventScroll: true});
            },
            reducedMotion ? 0 : 240,
        );
        return () => clearTimeout(timer);
    }, [active]);

    return (
        <div
            className={`composer-question-transition ${active ? 'composer-question-transition_question' : ''} ${moving ? 'composer-question-transition_moving' : ''}`}
            style={{height} as CSSProperties}
        >
            <div
                ref={composerRef}
                className="composer-question-transition__composer"
                aria-hidden={active}
            >
                {composer}
            </div>
            <div
                ref={questionRef}
                className="composer-question-transition__question"
                aria-hidden={!active}
            >
                {question ?? previousQuestion.current}
            </div>
        </div>
    );
}

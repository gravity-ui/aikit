import {useLayoutEffect, useMemo, useState} from 'react';
import type {ReactNode, RefObject} from 'react';

import {createPortal} from 'react-dom';

import {block} from '../../../utils/cn';
import type {MarkdownCodeBlockArtifact} from '../../../utils/markdownCodeBlockPlugin';

import type {MarkdownCodeBlockActionsConfig} from './MarkdownRenderer';

const b = block('markdown-renderer');
const CODE_BLOCK_SELECTOR = '[data-aikit-code-block]';
const CODE_TOOLBAR_SELECTOR = '.yfm-code-floating';
const LEGACY_CODE_BLOCK_SELECTOR = '.yfm-clipboard';
const LEGACY_COPY_BUTTON_SELECTOR = '.yfm-clipboard-button';
const CODE_BLOCK_ACTIONS_CLASSES = b('code-block').split(' ');
const CODE_BLOCK_VISIBLE_ACTIONS_CLASSES = b('code-block', {actionsVisible: true}).split(' ');
const CODE_BLOCK_SERVICE_CLASSES = Array.from(
    new Set([...CODE_BLOCK_ACTIONS_CLASSES, ...CODE_BLOCK_VISIBLE_ACTIONS_CLASSES]),
);

interface CodeBlockActionsPortal {
    action: ReactNode;
    target: HTMLSpanElement;
}

interface CodeBlockActionTarget {
    before: Element | null;
    legacy: boolean;
    parent: Element;
}

interface CodeBlockActionsPortalsProps {
    codeBlocks: MarkdownCodeBlockArtifact[];
    config: MarkdownCodeBlockActionsConfig;
    html: string;
    refCtr: RefObject<HTMLDivElement | null>;
}

const hasRenderedAction = (action: ReactNode) =>
    action !== null && action !== undefined && action !== false;

const getActionTarget = (element: HTMLElement): CodeBlockActionTarget | null => {
    const toolbar = element.querySelector(CODE_TOOLBAR_SELECTOR);
    if (toolbar) {
        return {before: toolbar.firstElementChild, legacy: false, parent: toolbar};
    }

    if (element.matches(LEGACY_CODE_BLOCK_SELECTOR)) {
        const copyButton = element.querySelector(LEGACY_COPY_BUTTON_SELECTOR);
        if (copyButton) {
            return {before: copyButton, legacy: true, parent: element};
        }
    }

    return null;
};

export function CodeBlockActionsPortals({
    codeBlocks,
    config,
    html,
    refCtr,
}: CodeBlockActionsPortalsProps) {
    const actions = useMemo(
        () =>
            codeBlocks.map((codeBlock, index) =>
                config.render({
                    ...codeBlock,
                    index,
                }),
            ),
        [codeBlocks, config.render],
    );
    const [portals, setPortals] = useState<CodeBlockActionsPortal[]>([]);

    useLayoutEffect(() => {
        const container = refCtr.current;
        if (!container) {
            setPortals([]);
            return undefined;
        }

        const codeBlockElements = Array.from(
            container.querySelectorAll<HTMLElement>(CODE_BLOCK_SELECTOR),
        );
        if (codeBlockElements.length !== codeBlocks.length) {
            setPortals([]);
            return undefined;
        }

        const actionTargets = codeBlockElements.map(getActionTarget);
        if (actionTargets.some((target) => !target)) {
            setPortals([]);
            return undefined;
        }

        const nextPortals: CodeBlockActionsPortal[] = [];
        codeBlockElements.forEach((element, index) => {
            const action = actions[index];
            const actionTarget = actionTargets[index];
            if (!actionTarget || !hasRenderedAction(action)) {
                return;
            }

            const target = document.createElement('span');
            target.className = b('code-block-actions', {legacy: actionTarget.legacy});
            actionTarget.parent.insertBefore(target, actionTarget.before);
            element.classList.add(...CODE_BLOCK_ACTIONS_CLASSES);

            if (config.visibility === 'always') {
                element.classList.add(...CODE_BLOCK_VISIBLE_ACTIONS_CLASSES);
            }

            nextPortals.push({action, target});
        });
        setPortals(nextPortals);

        return () => {
            codeBlockElements.forEach((element) => {
                element.classList.remove(...CODE_BLOCK_SERVICE_CLASSES);
            });
            nextPortals.forEach(({target}) => target.remove());
        };
    }, [actions, codeBlocks.length, config.visibility, html, refCtr]);

    return portals.map(({action, target}) => createPortal(action, target));
}

CodeBlockActionsPortals.displayName = 'CodeBlockActionsPortals';

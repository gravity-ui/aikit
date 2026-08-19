import {useLayoutEffect, useMemo, useState} from 'react';
import type {ReactNode, RefObject} from 'react';

import {createPortal} from 'react-dom';

import {block} from '../../../utils/cn';
import type {MarkdownCodeBlockArtifact} from '../../../utils/markdownCodeBlockPlugin';

const b = block('markdown-renderer');
const CODE_BLOCK_SELECTOR = '[data-aikit-code-block]';
const CODE_TOOLBAR_SELECTOR = '.yfm-code-floating';
const LEGACY_CODE_BLOCK_SELECTOR = '.yfm-clipboard';
const LEGACY_COPY_BUTTON_SELECTOR = '.yfm-clipboard-button';
const CODE_BLOCK_ACTIONS_CLASSES = b('code-block', {hasActions: true}).split(' ');
const CODE_BLOCK_VISIBLE_ACTIONS_CLASSES = b('code-block', {actionsVisible: true}).split(' ');

interface CodeBlockActionsPortal {
    action: ReactNode;
    key: string;
    target: HTMLSpanElement;
}

interface CodeBlockActionTarget {
    before: Element | null;
    legacy: boolean;
    parent: Element;
}

interface CodeBlockActionsPortalsProps {
    alwaysVisible: boolean;
    codeBlocks: MarkdownCodeBlockArtifact[];
    html: string;
    refCtr: RefObject<HTMLDivElement | null>;
    renderAction: (block: MarkdownCodeBlockArtifact & {index: number}) => ReactNode;
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
    alwaysVisible,
    codeBlocks,
    html,
    refCtr,
    renderAction,
}: CodeBlockActionsPortalsProps) {
    const actions = useMemo(
        () =>
            codeBlocks.map((codeBlock, index) =>
                renderAction({
                    ...codeBlock,
                    index,
                }),
            ),
        [codeBlocks, renderAction],
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
        if (codeBlockElements.length !== actions.length) {
            setPortals([]);
            return undefined;
        }

        const nextPortals: CodeBlockActionsPortal[] = [];
        codeBlockElements.forEach((element, index) => {
            const action = actions[index];
            const actionTarget = getActionTarget(element);
            if (!actionTarget || !hasRenderedAction(action)) {
                return;
            }

            const target = element.ownerDocument.createElement('span');
            target.className = b('code-block-actions', {legacy: actionTarget.legacy});
            actionTarget.parent.insertBefore(target, actionTarget.before);
            element.classList.add(...CODE_BLOCK_ACTIONS_CLASSES);

            if (alwaysVisible) {
                element.classList.add(...CODE_BLOCK_VISIBLE_ACTIONS_CLASSES);
            }

            nextPortals.push({action, key: `action-${index}`, target});
        });
        setPortals(nextPortals);

        return () => {
            codeBlockElements.forEach((element) => {
                element.classList.remove(
                    ...CODE_BLOCK_ACTIONS_CLASSES,
                    ...CODE_BLOCK_VISIBLE_ACTIONS_CLASSES,
                );
            });
            nextPortals.forEach(({target}) => target.remove());
        };
    }, [actions, alwaysVisible, html, refCtr]);

    return portals.map(({action, key, target}) => createPortal(action, target, key));
}

CodeBlockActionsPortals.displayName = 'CodeBlockActionsPortals';

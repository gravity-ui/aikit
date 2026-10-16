import {type RefObject, useContext, useEffect, useRef} from 'react';

import {ThemeContext, getThemeType} from '@gravity-ui/uikit';

import {MARKDOWN_MERMAID_CLASS} from '../utils/markdownMermaidPlugin';
import {renderMermaid} from '../utils/renderMermaid';

export function useMermaid(containerRef: RefObject<HTMLDivElement | null>, html: string) {
    const themeContext = useContext(ThemeContext);
    const theme = getThemeType(themeContext?.themeValue ?? 'light');
    const cacheRef = useRef(new Map<string, string>());

    useEffect(() => {
        const blocks = Array.from(
            containerRef.current?.querySelectorAll<HTMLElement>(`.${MARKDOWN_MERMAID_CLASS}`) ?? [],
        );
        const entries = blocks.map((block, index) => ({
            block,
            source: block.querySelector('code')?.textContent ?? '',
            // Identical diagrams in one message need distinct SVG identifiers.
            key: `${theme}:${index}:${block.querySelector('code')?.textContent ?? ''}`,
        }));
        const keys = new Set(entries.map(({key}) => key));
        const cache = cacheRef.current;
        for (const key of cache.keys()) {
            if (!keys.has(key)) {
                cache.delete(key);
            }
        }

        let active = true;
        const isActive = () => active;
        const cleanups: (() => void)[] = [];
        const display = (block: HTMLElement, svg: string) => {
            const source = block.querySelector('pre');
            const diagram = document.createElement('div');
            diagram.className = `${MARKDOWN_MERMAID_CLASS}-diagram`;
            diagram.innerHTML = svg;
            const svgElement = diagram.querySelector('svg');
            const width = svgElement?.viewBox.baseVal.width;
            if (svgElement && width) {
                svgElement.setAttribute('width', String(width));
                svgElement.style.maxWidth = 'none';
            }
            block.appendChild(diagram);
            block.setAttribute('tabindex', '0');
            if (source) {
                source.hidden = true;
            }
            cleanups.push(() => {
                diagram.remove();
                block.removeAttribute('tabindex');
                if (source) {
                    source.hidden = false;
                }
            });
        };

        const pending = entries.filter(({block, key}) => {
            const cached = cache.get(key);
            if (cached) {
                display(block, cached);
                return false;
            }
            return true;
        });

        // Coalesce rapid streaming updates; incomplete syntax stays as source.
        const timeout = window.setTimeout(async () => {
            for (const {block, source, key} of pending) {
                if (!active) {
                    return;
                }
                try {
                    const svg = await renderMermaid(source, theme, isActive);
                    if (active && svg) {
                        cache.set(key, svg);
                        display(block, svg);
                    }
                } catch {
                    // Keep the escaped source block and continue with other diagrams.
                }
            }
        }, 150);

        return () => {
            active = false;
            window.clearTimeout(timeout);
            cleanups.forEach((cleanup) => cleanup());
        };
    }, [containerRef, html, theme]);
}

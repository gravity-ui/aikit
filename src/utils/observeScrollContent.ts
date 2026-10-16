/** Observe the viewport and its content, including asynchronously resized messages. */
export function observeScrollContent(container: HTMLElement, onResize: () => void): () => void {
    let height = container.scrollHeight;
    let viewportHeight = container.clientHeight;
    let viewportWidth = container.clientWidth;
    const notifyResize = () => {
        const nextHeight = container.scrollHeight;
        const nextViewportHeight = container.clientHeight;
        const nextViewportWidth = container.clientWidth;
        if (
            nextHeight !== height ||
            nextViewportHeight !== viewportHeight ||
            nextViewportWidth !== viewportWidth
        ) {
            height = nextHeight;
            viewportHeight = nextViewportHeight;
            viewportWidth = nextViewportWidth;
            onResize();
        }
    };
    const resizeObserver = new ResizeObserver(notifyResize);
    resizeObserver.observe(container);

    // Plain lists have a content wrapper; virtualized lists replace measured rows.
    // Track direct children so both layouts and dynamically added footers are covered.
    const observed = new Set<Element>();
    const observeChildren = () => {
        const children = new Set(container.children);
        for (const child of observed) {
            if (!children.has(child)) {
                resizeObserver.unobserve(child);
                observed.delete(child);
            }
        }
        for (const child of children) {
            if (!observed.has(child)) {
                resizeObserver.observe(child);
                observed.add(child);
            }
        }
    };
    observeChildren();
    const mutationObserver = new MutationObserver(() => {
        observeChildren();
        notifyResize();
    });
    mutationObserver.observe(container, {childList: true});

    return () => {
        mutationObserver.disconnect();
        resizeObserver.disconnect();
    };
}

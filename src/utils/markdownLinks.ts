const ABSOLUTE_HTTP_URL_RE = /^(https?:)?\/\//i;

const isSameDocumentAnchor = (href: string) => {
    if (href.startsWith('#')) {
        return true;
    }

    if (ABSOLUTE_HTTP_URL_RE.test(href) || typeof window === 'undefined') {
        return false;
    }

    try {
        const url = new URL(href, window.location.href);
        return (
            Boolean(url.hash) &&
            url.origin === window.location.origin &&
            url.pathname === window.location.pathname &&
            url.search === window.location.search
        );
    } catch {
        return false;
    }
};

/** Shared policy for Markdown links and links emitted by diagram renderers. */
export function getNewTabLinkAttributes(href: string | null) {
    if (href && isSameDocumentAnchor(href)) {
        return undefined;
    }
    return {target: '_blank', rel: 'noopener noreferrer'};
}

export function applyNewTabLinkAttributes(container: ParentNode) {
    for (const link of container.querySelectorAll('a')) {
        const href =
            link.getAttribute('href') ??
            link.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        const attributes = getNewTabLinkAttributes(href);
        if (attributes) {
            for (const [name, value] of Object.entries(attributes)) {
                link.setAttribute(name, value);
            }
        }
    }
}

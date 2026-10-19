import {applyNewTabLinkAttributes, getNewTabLinkAttributes} from '../markdownLinks';

describe('Markdown and diagram link policy', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/chat?thread=1');
    });

    test.each(['#details', '/chat?thread=1#details', '?thread=1#details'])(
        'preserves same-document anchor %s',
        (href) => {
            expect(getNewTabLinkAttributes(href)).toBeUndefined();
        },
    );

    test.each([
        'https://example.com/docs',
        '//example.com/docs',
        '/chat?thread=2#details',
        '/chat?thread=1',
        'mailto:hello@example.com',
    ])('opens navigation link %s in a new tab', (href) => {
        expect(getNewTabLinkAttributes(href)).toEqual({
            target: '_blank',
            rel: 'noopener noreferrer',
        });
    });

    test('applies the policy to SVG href and legacy xlink:href without changing anchors', () => {
        const container = document.createElement('div');
        container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <a href="https://example.com/first" target="_self"><text>First</text></a>
            <a xlink:href="https://example.com/second"><text>Second</text></a>
            <a href="#details"><text>Anchor</text></a>
        </svg>`;
        applyNewTabLinkAttributes(container);
        const [first, second, anchor] = container.querySelectorAll('a');
        for (const link of [first, second]) {
            expect(link.getAttribute('target')).toBe('_blank');
            expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        }
        expect(anchor.getAttribute('target')).toBeNull();
        expect(anchor.getAttribute('rel')).toBeNull();
    });
});

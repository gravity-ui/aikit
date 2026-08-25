import {useMdx} from '@diplodoc/mdx-extension';
import {render, waitFor} from '@testing-library/react';

import {MdxPortals} from '../MdxPortals';

jest.mock('@diplodoc/mdx-extension', () => ({
    useMdx: jest.fn(() => null),
}));

const mockedUseMdx = jest.mocked(useMdx);

describe('MdxPortals', () => {
    afterEach(() => {
        mockedUseMdx.mockClear();
        document.head.querySelectorAll('script[data-test-csp-nonce]').forEach((script) => {
            script.remove();
        });
    });

    test('should discover the CSP nonce from an existing script', async () => {
        const script = document.createElement('script');
        script.dataset.testCspNonce = 'true';
        script.nonce = 'page-nonce';
        document.head.appendChild(script);

        render(
            <MdxPortals
                refCtr={{current: document.createElement('div')}}
                html=""
                mdxArtifacts={{idMdx: {}, idTagName: {}}}
            />,
        );

        await waitFor(() => {
            expect(mockedUseMdx).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    idMdxComponentLoader: expect.objectContaining({
                        isSuccess: true,
                        nonce: 'page-nonce',
                    }),
                }),
            );
        });
    });

    test('should use the explicitly provided nonce', async () => {
        const script = document.createElement('script');
        script.dataset.testCspNonce = 'true';
        script.nonce = 'page-nonce';
        document.head.appendChild(script);

        render(
            <MdxPortals
                refCtr={{current: document.createElement('div')}}
                html=""
                mdxArtifacts={{idMdx: {}, idTagName: {}}}
                nonce="explicit-nonce"
            />,
        );

        await waitFor(() => {
            expect(mockedUseMdx).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    idMdxComponentLoader: expect.objectContaining({
                        isSuccess: true,
                        nonce: 'explicit-nonce',
                    }),
                }),
            );
        });
    });

    test('should use the legacy MDX loader when nonce is not available', () => {
        render(
            <MdxPortals
                refCtr={{current: document.createElement('div')}}
                html=""
                mdxArtifacts={{idMdx: {}, idTagName: {}}}
            />,
        );

        expect(mockedUseMdx).toHaveBeenCalledWith(
            expect.objectContaining({idMdxComponentLoader: undefined}),
        );
    });
});

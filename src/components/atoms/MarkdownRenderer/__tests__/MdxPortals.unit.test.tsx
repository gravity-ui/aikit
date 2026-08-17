import {useMdx} from '@diplodoc/mdx-extension';
import {render} from '@testing-library/react';

import {MdxPortals} from '../MdxPortals';

jest.mock('@diplodoc/mdx-extension', () => ({
    useMdx: jest.fn(() => null),
}));

const mockedUseMdx = jest.mocked(useMdx);

describe('MdxPortals', () => {
    test('should use the legacy MDX loader when nonce is not provided', () => {
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

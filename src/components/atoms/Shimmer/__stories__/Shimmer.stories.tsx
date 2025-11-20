import React from 'react';

import {Meta, StoryFn} from '@storybook/react-webpack5';

import {Shimmer, ShimmerProps} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/Shimmer',
    component: Shimmer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        children: {
            control: 'text',
            description: 'Content to apply shimmer to',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

export const Playground: StoryFn<ShimmerProps> = (args) => (
    <ContentWrapper>
        <Shimmer {...args}>
            <span>Awaiting confirmation</span>
        </Shimmer>
    </ContentWrapper>
);

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ScrollToBottomButton} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'experimental/ScrollToBottomButton',
    component: ScrollToBottomButton,
    parameters: {docs: {page: MDXDocs}},
    decorators: [
        (Story) => (
            <div style={{padding: 24}}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ScrollToBottomButton>;

type Story = StoryObj<typeof ScrollToBottomButton>;

export const Playground: Story = {args: {streaming: false}};
export const Streaming: Story = {args: {streaming: true}};
export const Disabled: Story = {args: {disabled: true}};

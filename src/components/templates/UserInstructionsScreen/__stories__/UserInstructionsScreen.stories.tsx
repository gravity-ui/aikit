import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {UserInstructionsScreen} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';

import MDXDocs from './Docs.mdx';

export default {
    title: 'templates/UserInstructionsScreen',
    component: UserInstructionsScreen,
    parameters: {docs: {page: MDXDocs}},
} satisfies Meta<typeof UserInstructionsScreen>;

type Story = StoryObj<typeof UserInstructionsScreen>;
const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="480px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {
    decorators: defaultDecorators,
    args: {value: '', maxLength: 2000, onSave: async () => {}, onCancel: () => {}},
};
export const WithValue: Story = {
    ...Playground,
    args: {...Playground.args, value: 'Use concise answers and include examples.'},
};
export const SaveFailure: Story = {
    ...WithValue,
    args: {
        ...WithValue.args,
        onSave: async () => {
            throw new Error('Example persistence failure');
        },
    },
};
export const OverLimit: Story = {
    ...WithValue,
    args: {...WithValue.args, maxLength: 12},
};

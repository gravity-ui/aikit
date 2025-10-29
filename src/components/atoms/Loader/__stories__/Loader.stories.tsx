import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {Loader, LoaderProps} from '..';

export default {
    title: 'Loader',
    component: Loader,
} as Meta;

type Story = StoryObj<typeof Loader>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<LoaderProps> = (args) => <Loader {...args} />;
Playground.storyName = 'Streaming';

export const Spin: StoryFn<LoaderProps> = (args) => <Loader {...args} view="loading" />;
Spin.storyName = 'Loading';

export const Size: StoryObj<LoaderProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="Size s">
                <Loader {...args} size="s" />
            </ShowcaseItem>
            <ShowcaseItem title="Size m">
                <Loader {...args} size="m" />
            </ShowcaseItem>
            <ShowcaseItem title="Size l">
                <Loader {...args} size="l" />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
    args: {view: 'streaming'},
};
Size.storyName = 'Size';

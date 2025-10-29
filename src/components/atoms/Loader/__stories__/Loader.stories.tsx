import {Meta, StoryFn, StoryObj} from '@storybook/react';
import {Loader, LoaderProps} from '..';

export default {
    title: 'Loader',
    component: Loader,
} as Meta;

export const Playground: StoryFn<LoaderProps> = (args) => <Loader {...args} />;
Playground.storyName = 'Loader';

export const Spin: StoryFn<LoaderProps> = (args) => <Loader {...args} view="loading" />;
Spin.storyName = 'Spin';

export const Size: StoryObj<LoaderProps> = {
    render: (args) => (
        <>
            <div>
                <Loader {...args} size="s" />
            </div>
            <div>
                <Loader {...args} size="m" />
            </div>
            <div>
                <Loader {...args} size="l" />
            </div>
        </>
    ),
    args: {view: 'streaming'},
};
Size.storyName = 'Size';

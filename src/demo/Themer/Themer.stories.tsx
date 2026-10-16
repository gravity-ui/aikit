import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {Themer} from './Themer';

export default {
    title: 'Theming/Themer',
    component: Themer,
    parameters: {layout: 'fullscreen', controls: {disable: true}},
} satisfies Meta<typeof Themer>;

export const Playground: StoryObj<typeof Themer> = {};

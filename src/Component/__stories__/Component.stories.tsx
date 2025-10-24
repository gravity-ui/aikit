import React from 'react';
import {Meta, StoryFn} from '@storybook/react';
import {Component, ComponentProps} from '..';

export default {
    title: 'Component',
    component: Component,
} as Meta;

export const Playground: StoryFn<ComponentProps> = (args) => <Component {...args} />;
Playground.storyName = 'Component';

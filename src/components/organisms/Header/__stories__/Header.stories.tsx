import React, {useState} from 'react';

import {Gear} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {Header, HeaderAction, type HeaderProps} from '../index';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/Header',
    component: Header,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        titlePosition: {
            control: 'radio',
            options: ['left', 'center'],
            description: 'Title position',
        },
    },
} as Meta;

type Story = StoryObj<typeof Header>;

const defaultDecorators = [
    (Story: StoryFn) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

// Mock handlers for actions
const mockHandlers = {
    handleNewChat: () => {
        // eslint-disable-next-line no-console
        console.log('New chat clicked');
    },
    handleHistoryToggle: () => {
        // eslint-disable-next-line no-console
        console.log('History toggle clicked');
    },
    handleFolding: (value: 'collapsed' | 'opened') => {
        // eslint-disable-next-line no-console
        console.log('Folding clicked:', value);
    },
    handleClose: () => {
        // eslint-disable-next-line no-console
        console.log('Close clicked');
    },
};

export const Playground: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header {...args} />
        </ContentWrapper>
    );
};

Playground.args = {
    title: 'Chat Header',
    baseActions: [
        HeaderAction.NewChat,
        HeaderAction.History,
        HeaderAction.Folding,
        HeaderAction.Close,
    ],
    foldingState: 'opened',
    ...mockHandlers,
};

export const WithTitle: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                title="Chat Header"
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

export const WithIcon: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                icon={<div style={{width: 24, height: 24, background: '#ccc', borderRadius: 4}} />}
                title="Chat Header"
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

export const WithoutIcon: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                withIcon={false}
                title="Chat Header"
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

export const WithPreview: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                title="Chat Header"
                preview={<div>Preview</div>}
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

export const WithoutTitle: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                title="Chat Header"
                preview={<div>Preview</div>}
                showTitle={false}
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

export const TitlePositions: StoryObj<HeaderProps> = {
    render: (args) => {
        return (
            <>
                <ShowcaseItem title="Left">
                    <ContentWrapper width="480px">
                        <Header
                            title="Left Title"
                            titlePosition="left"
                            baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
                            {...mockHandlers}
                            {...args}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Center">
                    <ContentWrapper width="480px">
                        <Header
                            title="Center Title"
                            titlePosition="center"
                            baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
                            {...mockHandlers}
                            {...args}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
            </>
        );
    },
    decorators: defaultDecorators,
};

export const BaseActions: StoryObj<HeaderProps> = {
    render: (args) => {
        return (
            <>
                <ShowcaseItem title="All actions">
                    <ContentWrapper width="480px">
                        <Header
                            title="All Actions"
                            baseActions={[
                                HeaderAction.NewChat,
                                HeaderAction.History,
                                HeaderAction.Folding,
                                HeaderAction.Close,
                            ]}
                            foldingState="opened"
                            {...mockHandlers}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Folding opened">
                    <ContentWrapper width="480px">
                        <Header
                            title="With Folding (opened)"
                            baseActions={[
                                HeaderAction.NewChat,
                                HeaderAction.History,
                                HeaderAction.Folding,
                            ]}
                            foldingState="opened"
                            {...mockHandlers}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Folding collapsed">
                    <ContentWrapper width="480px">
                        <Header
                            title="With Folding (collapsed)"
                            baseActions={[
                                HeaderAction.NewChat,
                                HeaderAction.History,
                                HeaderAction.Folding,
                            ]}
                            foldingState="collapsed"
                            {...mockHandlers}
                            {...args}
                        />
                    </ContentWrapper>
                </ShowcaseItem>
            </>
        );
    },
    decorators: defaultDecorators,
};

export const AdditionalActions: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                title="With Additional Actions"
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                additionalActions={[
                    {
                        children: 'Action 1',
                        onClick: () => {
                            // eslint-disable-next-line no-console
                            console.log('Additional action 1');
                        },
                    },
                    <Button key="settings" size="m" view="flat">
                        <Icon data={Gear} size={16} />
                    </Button>,
                ]}
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

export const FullExample: StoryFn<HeaderProps> = (args) => {
    return (
        <ContentWrapper width="480px">
            <Header
                icon={<div style={{width: 24, height: 24, background: '#ccc', borderRadius: 4}} />}
                title="Chat Header"
                preview={<div>Preview</div>}
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                additionalActions={[
                    {
                        children: 'Settings',
                        view: 'outlined',
                        size: 'm',
                        onClick: () => {
                            // eslint-disable-next-line no-console
                            console.log('Settings clicked');
                        },
                    },
                    <Button key="settings" size="m" view="flat">
                        <Icon data={Gear} size={16} />
                    </Button>,
                ]}
                titlePosition="center"
                {...mockHandlers}
                {...args}
            />
        </ContentWrapper>
    );
};

// Interactive story to demonstrate folding state toggle
export const FoldingInteractive: StoryFn<HeaderProps> = (args) => {
    const [foldingState, setFoldingState] = useState<'collapsed' | 'opened'>('opened');

    return (
        <ContentWrapper width="480px">
            <Header
                title="Interactive Folding"
                baseActions={[
                    HeaderAction.NewChat,
                    HeaderAction.History,
                    HeaderAction.Folding,
                    HeaderAction.Close,
                ]}
                foldingState={foldingState}
                handleFolding={(value) => {
                    setFoldingState(value);
                    // eslint-disable-next-line no-console
                    console.log('Folding state changed to:', value);
                }}
                handleNewChat={mockHandlers.handleNewChat}
                handleHistoryToggle={mockHandlers.handleHistoryToggle}
                handleClose={mockHandlers.handleClose}
                {...args}
            />
        </ContentWrapper>
    );
};

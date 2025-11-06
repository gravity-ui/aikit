import {useState} from 'react';

import {Gear} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import {Meta, StoryFn, StoryObj} from '@storybook/react';

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
            options: ['left', 'center', 'right'],
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
    return <Header {...args} />;
};

const HeaderWrapper = ({children}: {children: React.ReactNode}) => {
    return <div style={{width: 480, border: '1px solid green'}}>{children}</div>;
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
        <HeaderWrapper>
            <Header
                title="Chat Header"
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </HeaderWrapper>
    );
};

export const WithIcon: StoryFn<HeaderProps> = (args) => {
    return (
        <HeaderWrapper>
            <Header
                icon={<div style={{width: 24, height: 24, background: '#ccc', borderRadius: 4}} />}
                title="Chat Header"
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </HeaderWrapper>
    );
};

export const WithPreview: StoryFn<HeaderProps> = (args) => {
    return (
        <HeaderWrapper>
            <Header
                title="Chat Header"
                preview={<div>Preview</div>}
                baseActions={[HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close]}
                {...mockHandlers}
                {...args}
            />
        </HeaderWrapper>
    );
};

export const TitlePositions: StoryObj<HeaderProps> = {
    render: (args) => {
        return (
            <>
                <ShowcaseItem title="Left">
                    <HeaderWrapper>
                        <Header
                            title="Left Title"
                            titlePosition="left"
                            baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
                            {...mockHandlers}
                            {...args}
                        />
                    </HeaderWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Center">
                    <HeaderWrapper>
                        <Header
                            title="Center Title"
                            titlePosition="center"
                            baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
                            {...mockHandlers}
                            {...args}
                        />
                    </HeaderWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Right">
                    <HeaderWrapper>
                        <Header
                            title="Right Title"
                            titlePosition="right"
                            baseActions={[HeaderAction.NewChat, HeaderAction.Close]}
                            {...mockHandlers}
                            {...args}
                        />
                    </HeaderWrapper>
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
                    <HeaderWrapper>
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
                    </HeaderWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Folding opened">
                    <HeaderWrapper>
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
                    </HeaderWrapper>
                </ShowcaseItem>
                <ShowcaseItem title="Folding collapsed">
                    <HeaderWrapper>
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
                    </HeaderWrapper>
                </ShowcaseItem>
            </>
        );
    },
    decorators: defaultDecorators,
};

export const AdditionalActions: StoryFn<HeaderProps> = (args) => {
    return (
        <HeaderWrapper>
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
        </HeaderWrapper>
    );
};

export const FullExample: StoryFn<HeaderProps> = (args) => {
    return (
        <HeaderWrapper>
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
        </HeaderWrapper>
    );
};

// Interactive story to demonstrate folding state toggle
export const FoldingInteractive: StoryFn<HeaderProps> = (args) => {
    const [foldingState, setFoldingState] = useState<'collapsed' | 'opened'>('opened');

    return (
        <HeaderWrapper>
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
        </HeaderWrapper>
    );
};

/* eslint-disable no-console */
import React, {useState} from 'react';

import {Button} from '@gravity-ui/uikit';
import type {Meta, StoryFn, StoryObj} from '@storybook/react-webpack5';

import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';
import {FeedbackForm} from '../../FeedbackForm';
import {ActionPopup, type ActionPopupProps} from '../ActionPopup';

import MDXDocs from './Docs.mdx';

export default {
    title: 'molecules/ActionPopup',
    component: ActionPopup,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        open: {
            control: 'boolean',
            description: 'Control popup open state',
        },
        title: {
            control: 'text',
            description: 'Optional title text',
        },
        subtitle: {
            control: 'text',
            description: 'Optional subtitle text',
        },
        placement: {
            control: 'select',
            options: [
                'top-start',
                'top',
                'top-end',
                'right-start',
                'right',
                'right-end',
                'bottom-start',
                'bottom',
                'bottom-end',
                'left-start',
                'left',
                'left-end',
            ],
            description: 'Popup placement relative to anchor',
        },
    },
} as Meta;

type Story = StoryObj<typeof ActionPopup>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

const PopupWrapper = (args: Partial<ActionPopupProps>) => {
    const [open, setOpen] = useState(false);
    const [anchorRef, setAnchorRef] = useState<HTMLButtonElement | null>(null);

    return (
        <ContentWrapper>
            <div
                style={{
                    minHeight: '400px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Button ref={setAnchorRef} view="action" onClick={() => setOpen(!open)}>
                    Open Popup
                </Button>
                <ActionPopup {...args} open={open} onOpenChange={setOpen} anchorElement={anchorRef}>
                    {args.children}
                </ActionPopup>
            </div>
        </ContentWrapper>
    );
};

export const Playground: StoryFn<ActionPopupProps> = (args) => <PopupWrapper {...args} />;

Playground.args = {
    title: 'Popup Title',
    subtitle: 'Optional subtitle text',
    children: (
        <div>
            <p>This is the popup content. You can put any React content here.</p>
            <Button view="action" size="m" width="max">
                Action Button
            </Button>
        </div>
    ),
    placement: 'bottom-start',
};

export const WithTitleOnly: Story = {
    render: () => (
        <ShowcaseItem title="Title Only">
            <PopupWrapper title="What went wrong?" placement="bottom-start">
                <div>
                    <p style={{margin: 0}}>Popup content without subtitle</p>
                </div>
            </PopupWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithTitleAndSubtitle: Story = {
    render: () => (
        <ShowcaseItem title="Title and Subtitle">
            <PopupWrapper
                title="Feedback Form"
                subtitle="Tell us what went wrong"
                placement="bottom-start"
            >
                <div>
                    <p style={{margin: 0}}>Both title and subtitle are displayed</p>
                </div>
            </PopupWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithoutTitleOrSubtitle: Story = {
    render: () => (
        <ShowcaseItem title="No Header">
            <PopupWrapper placement="bottom-start">
                <div style={{padding: '8px 0'}}>
                    <p style={{margin: 0}}>
                        No title or subtitle — no close button either. Close by clicking outside.
                        Useful for transient success states that auto-close.
                    </p>
                </div>
            </PopupWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const WithFormContent: Story = {
    render: () => (
        <ShowcaseItem title="With Form Content">
            <PopupWrapper title="What was wrong?" placement="bottom-start">
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        {['No answer', 'Wrong info', 'Not helpful', 'Other'].map((reason) => (
                            <Button key={reason} view="outlined" size="s">
                                {reason}
                            </Button>
                        ))}
                    </div>
                    <textarea
                        placeholder="Tell us more..."
                        style={{
                            width: '100%',
                            minHeight: '60px',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid var(--g-color-line-generic)',
                            fontFamily: 'inherit',
                            fontSize: '13px',
                            resize: 'vertical',
                        }}
                    />
                    <Button view="action" size="m" width="max">
                        Submit
                    </Button>
                </div>
            </PopupWrapper>
        </ShowcaseItem>
    ),
    decorators: defaultDecorators,
};

export const DifferentPlacements: Story = {
    render: () => {
        const [openTop, setOpenTop] = useState(false);
        const [openBottom, setOpenBottom] = useState(false);
        const [openLeft, setOpenLeft] = useState(false);
        const [openRight, setOpenRight] = useState(false);

        const [topRef, setTopRef] = useState<HTMLButtonElement | null>(null);
        const [bottomRef, setBottomRef] = useState<HTMLButtonElement | null>(null);
        const [leftRef, setLeftRef] = useState<HTMLButtonElement | null>(null);
        const [rightRef, setRightRef] = useState<HTMLButtonElement | null>(null);

        return (
            <ShowcaseItem title="Different Placements">
                <ContentWrapper>
                    <div
                        style={{
                            minHeight: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '40px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '60px',
                        }}
                    >
                        <Button
                            ref={setTopRef}
                            view="outlined"
                            onClick={() => setOpenTop(!openTop)}
                        >
                            Top
                        </Button>

                        <div style={{display: 'flex', gap: '200px', alignItems: 'center'}}>
                            <Button
                                ref={setLeftRef}
                                view="outlined"
                                onClick={() => setOpenLeft(!openLeft)}
                            >
                                Left
                            </Button>
                            <Button
                                ref={setRightRef}
                                view="outlined"
                                onClick={() => setOpenRight(!openRight)}
                            >
                                Right
                            </Button>
                        </div>

                        <Button
                            ref={setBottomRef}
                            view="outlined"
                            onClick={() => setOpenBottom(!openBottom)}
                        >
                            Bottom
                        </Button>

                        <ActionPopup
                            open={openTop}
                            onOpenChange={setOpenTop}
                            anchorElement={topRef}
                            title="Top Placement"
                            placement="top"
                        >
                            <p style={{margin: 0}}>Opens above the button</p>
                        </ActionPopup>

                        <ActionPopup
                            open={openBottom}
                            onOpenChange={setOpenBottom}
                            anchorElement={bottomRef}
                            title="Bottom Placement"
                            placement="bottom"
                        >
                            <p style={{margin: 0}}>Opens below the button</p>
                        </ActionPopup>

                        <ActionPopup
                            open={openLeft}
                            onOpenChange={setOpenLeft}
                            anchorElement={leftRef}
                            title="Left Placement"
                            placement="left"
                        >
                            <p style={{margin: 0}}>Opens to the left</p>
                        </ActionPopup>

                        <ActionPopup
                            open={openRight}
                            onOpenChange={setOpenRight}
                            anchorElement={rightRef}
                            title="Right Placement"
                            placement="right"
                        >
                            <p style={{margin: 0}}>Opens to the right</p>
                        </ActionPopup>
                    </div>
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithContentChange: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        const [anchorRef, setAnchorRef] = useState<HTMLButtonElement | null>(null);
        const [title, setTitle] = useState<string | undefined>('What went wrong?');
        const [content, setContent] = useState<React.ReactNode>(
            <p style={{margin: 0}}>
                Click &quot;Submit&quot; to see the content change without closing.
            </p>,
        );

        const handleOpen = () => {
            setTitle('What went wrong?');
            setContent(
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    <p style={{margin: 0}}>Some feedback content here.</p>
                    <Button
                        view="action"
                        size="m"
                        onClick={() => {
                            setTitle(undefined);
                            setContent(
                                <p style={{margin: 0}}>
                                    ✓ Thank you! Popup stays open, only content changed.
                                </p>,
                            );
                            setTimeout(() => setOpen(false), 2000);
                        }}
                    >
                        Submit
                    </Button>
                </div>,
            );
            setOpen(true);
        };

        return (
            <ShowcaseItem title="Content Change">
                <ContentWrapper>
                    <div
                        style={{
                            minHeight: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Button ref={setAnchorRef} view="action" onClick={handleOpen}>
                            Open (content changes on submit)
                        </Button>
                        <ActionPopup
                            open={open}
                            onOpenChange={setOpen}
                            anchorElement={anchorRef}
                            title={title}
                            placement="bottom-start"
                        >
                            {content}
                        </ActionPopup>
                    </div>
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

export const WithFeedbackForm: Story = {
    render: () => {
        const [open, setOpen] = useState(false);
        const [anchorRef, setAnchorRef] = useState<HTMLButtonElement | null>(null);
        const [title, setTitle] = useState<string | undefined>('What went wrong?');
        const [content, setContent] = useState<React.ReactNode>(null);

        const openForm = () => {
            setTitle('What went wrong?');
            setContent(
                <FeedbackForm
                    options={[
                        {id: 'no-answer', label: 'No answer'},
                        {id: 'not-helpful', label: 'Not helpful'},
                        {id: 'wrong-info', label: 'Wrong information'},
                        {id: 'other', label: 'Other'},
                    ]}
                    onSubmit={(reasons: string[], comment: string) => {
                        console.log('Feedback submitted:', {reasons, comment});
                        setTitle(undefined);
                        setContent(<div>Thank you for your feedback!</div>);
                        setTimeout(() => setOpen(false), 2000);
                    }}
                    commentPlaceholder="Tell us more..."
                    submitLabel="Submit"
                    qa="feedback-form"
                />,
            );
            setOpen(true);
        };

        return (
            <ShowcaseItem title="With Feedback Form">
                <ContentWrapper>
                    <div
                        style={{
                            minHeight: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Button ref={setAnchorRef} view="action" onClick={openForm}>
                            Open Feedback Form
                        </Button>
                        <ActionPopup
                            open={open}
                            onOpenChange={setOpen}
                            anchorElement={anchorRef}
                            title={title}
                            placement="bottom-start"
                        >
                            {content}
                        </ActionPopup>
                    </div>
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

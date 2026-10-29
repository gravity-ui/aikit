import {useState} from 'react';

import {withPortal} from '@diplodoc/mdx-extension';
import {Button} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {InlineCitation, type InlineCitationSource} from '..';
import {ContentWrapper} from '../../../../demo/ContentWrapper';
import {MarkdownRenderer, useMdxContext} from '../../MarkdownRenderer';

import MDXDocs from './Docs.mdx';

const sources: InlineCitationSource[] = [
    {
        id: 'aikit',
        title: 'AIKit: components for AI assistants',
        url: 'https://github.com/gravity-ui/aikit',
        description: 'Reusable components for building AI assistant chats with Gravity UI.',
        quote: 'Gravity UI base kit for building AI assistant chats.',
    },
    {
        id: 'uikit',
        title: 'Gravity UI',
        url: 'https://gravity-ui.com',
        description: 'An open source design system and component library.',
    },
    {id: 'docs', url: 'https://gravity-ui.com/components/uikit/popup'},
];

export default {
    title: 'atoms/InlineCitation',
    component: InlineCitation,
    parameters: {docs: {page: MDXDocs}},
    args: {sources},
    argTypes: {
        onOpenChange: {action: 'open changed'},
        onSourceClick: {action: 'source clicked'},
    },
} satisfies Meta<typeof InlineCitation>;

type Story = StoryObj<typeof InlineCitation>;

const defaultDecorators = [
    (Story) => (
        <ContentWrapper width="min(100%, 600px)" minHeight="360px">
            <Story />
        </ContentWrapper>
    ),
] satisfies Story['decorators'];

export const Playground: Story = {decorators: defaultDecorators};

export const Default: Story = {
    args: {sources: [sources[0]]},
    decorators: defaultDecorators,
};

export const MultipleSources: Story = {
    args: {defaultOpen: true},
    decorators: defaultDecorators,
};

export const MinimalSource: Story = {
    args: {sources: [sources[2]]},
    decorators: defaultDecorators,
};

export const CustomLabel: Story = {
    args: {label: 'Documentation'},
    decorators: defaultDecorators,
};

export const Empty: Story = {args: {sources: []}, decorators: defaultDecorators};

export const InvalidUrl: Story = {
    args: {sources: [{id: 'invalid', url: 'not-a-url', title: 'Unavailable source'}]},
    decorators: defaultDecorators,
};

export const NarrowContainer: Story = {
    args: {
        sources: [
            {
                id: 'long',
                url: 'https://example.com/documentation',
                title: 'A detailed source title that wraps across several lines in a narrow card',
                description: 'LongUnbrokenContent'.repeat(12),
                quote: 'A long excerpt from a document. '.repeat(30),
            },
        ],
    },
    render: (args) => (
        <ContentWrapper width="180px" minHeight="360px">
            <p>
                The cited documentation explains this behavior <InlineCitation {...args} /> in
                detail.
            </p>
        </ContentWrapper>
    ),
};

function ControlledExample() {
    const [open, setOpen] = useState(false);
    const [availableSources, setAvailableSources] = useState(sources);
    return (
        <>
            <Button onClick={() => setOpen(!open)}>Toggle sources</Button>{' '}
            <Button onClick={() => setAvailableSources((current) => current.slice(0, -1))}>
                Remove last source
            </Button>
            <p>
                Explore the documentation{' '}
                <InlineCitation sources={availableSources} open={open} onOpenChange={setOpen} />.
            </p>
        </>
    );
}

export const Controlled: Story = {
    render: () => <ControlledExample />,
    decorators: defaultDecorators,
};

function CustomNavigationExample() {
    const [selectedSource, setSelectedSource] = useState<string>();
    return (
        <>
            <p>
                Open a source in the host application{' '}
                <InlineCitation
                    sources={sources}
                    onSourceClick={(source, event) => {
                        event.preventDefault();
                        setSelectedSource(source.title ?? source.url);
                    }}
                />
                .
            </p>
            <p role="status">Selected source: {selectedSource ?? 'None'}</p>
        </>
    );
}

export const CustomNavigation: Story = {
    render: () => <CustomNavigationExample />,
    decorators: defaultDecorators,
};

function MessageCitation({sourceId}: {sourceId?: string}) {
    const context = useMdxContext<{sources: InlineCitationSource[]}>();
    return (
        <InlineCitation
            sources={context?.sources.filter((source) => source.id === sourceId) ?? []}
        />
    );
}

const mdxOptions = {components: {Citation: withPortal(MessageCitation)}};

export const InMarkdownMessage: Story = {
    render: () => (
        <>
            <MarkdownRenderer
                content={'AIKit provides reusable chat components <Citation sourceId="aikit" />.'}
                mdxOptions={mdxOptions}
                mdxContext={{sources}}
            />
            <MarkdownRenderer
                content={'Each message resolves its own sources <Citation sourceId="aikit" />.'}
                mdxOptions={mdxOptions}
                mdxContext={{
                    sources: [{id: 'aikit', url: 'https://example.com', title: 'Another message'}],
                }}
            />
        </>
    ),
    decorators: defaultDecorators,
};

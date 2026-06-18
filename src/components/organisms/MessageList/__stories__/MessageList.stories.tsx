import {Meta} from '@storybook/react-webpack5';

import {MessageList} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'organisms/MessageList',
    component: MessageList,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        messages: {
            control: 'object',
            description: 'Array of messages to render',
        },
        messageRendererRegistry: {
            control: false,
            description: 'Custom message renderer registry',
        },
        showActionsOnHover: {
            control: 'boolean',
            description: 'Show action buttons on hover for all messages',
        },
        showTimestamp: {
            control: 'boolean',
            description: 'Show timestamp for all messages',
        },
        showAvatar: {
            control: 'boolean',
            description: 'Show avatar for user messages',
        },
        virtualized: {
            control: 'boolean',
            description:
                'Enable windowed rendering via react-window for very large histories (off by default)',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
    },
} as Meta;

// Stories are split across grouped modules under `./parts` for readability.
// They are re-exported here so Storybook renders them under a single
// `organisms/MessageList` entry. The export order below defines the sidebar order.

export {Playground, WithSubmittedStatus, WithErrorMessage, WithToolMessage} from './parts/basic';

export {WithCustomMessageType} from './parts/customMessageType';

export {WithStreamingMessage} from './parts/basic';

export {WithDefaultActions, WithUserRating} from './parts/actions';

export {WithPreviousMessages} from './parts/previousMessages';

export {
    WithRatingBlock,
    WithRatingBlockLowRating,
    WithRatingBlockCustomSize,
    WithRatingBlockHidden,
    WithRatingBlockManyMessages,
} from './parts/ratingBlock';

export {WithFeedbackPopup, WithMultipleActionPopups} from './parts/popups';

export {
    Virtualized,
    VirtualizedWithPreviousMessages,
    VirtualizedStreaming,
} from './parts/virtualized';

export {VirtualizationComparison} from './parts/previousMessages';

export {WithExtraInfo} from './parts/basic';

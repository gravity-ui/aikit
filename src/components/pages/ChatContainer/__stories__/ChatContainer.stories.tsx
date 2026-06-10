import type {Meta} from '@storybook/react-webpack5';

import {ChatContainer} from '..';

import MDXDocs from './Docs.mdx';

export default {
    title: 'pages/ChatContainer',
    component: ChatContainer,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
} as Meta;

// Stories are split across grouped modules under `./parts` for readability.
// They are re-exported here so Storybook renders them under a single
// `pages/ChatContainer` entry. The export order below defines the sidebar order.

export {Playground, EmptyState, WithMessages, WithStreaming, WithHistory} from './parts/basic';

export {
    EmptyStateWithTextWrap,
    EmptyStateWithCustomElements,
    EmptyStateWithCenteredAlignment,
} from './parts/welcome';

export {
    WithCustomTexts,
    WithComponentPropsOverride,
    WithQaString,
    WithQaPrefix,
    WithQaExplicit,
    WithTexts,
    WithTextsStreaming,
    WithTextsError,
} from './parts/customization';

export {
    WithContextItems,
    WithContextItemsAndIndicator,
    WithContextIndicatorTooltip,
} from './parts/context';

export {LoadingState, ErrorState, FullStreamingExample} from './parts/states';

export {HiddenTitleOnEmpty} from './parts/welcome';

export {EmbeddedInPageWithStreaming} from './parts/states';

export {
    WithAdditionalActions,
    WithLikeDislikeActions,
    WithRatingBlock,
    WithRatingBlockDynamicScenarios,
} from './parts/actions';

export {WithFileAttachments} from './parts/attachments';

export {WithActionPopup} from './parts/actions';

export {WithAttachmentInput} from './parts/attachments';

export {WithCustomMessageTypes} from './parts/customMessageTypes';

import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {AgentChat} from '..';

import MDXDocs from './Docs.mdx';
import {ChatPlayground} from './playground/ChatPlayground';
import {QuestionScenario} from './playground/QuestionScenario';

export default {
    title: 'experimental/AgentChat',
    component: AgentChat,
    parameters: {layout: 'fullscreen', docs: {page: MDXDocs}},
} satisfies Meta<typeof AgentChat>;

export const Playground: StoryObj<typeof AgentChat> = {
    render: () => (
        <div className="chat-playground-decorator">
            <div className="chat-playground-decorator__container">
                <ChatPlayground />
            </div>
        </div>
    ),
};

export const ClarificationQuestion: StoryObj<typeof AgentChat> = {
    render: () => <QuestionScenario />,
};

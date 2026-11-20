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

function renderPlayground(flow?: 'plan') {
    return (
        <div className="chat-playground-decorator">
            <div className="chat-playground-decorator__container">
                <ChatPlayground flow={flow} />
            </div>
        </div>
    );
}

export const Playground: StoryObj<typeof AgentChat> = {render: () => renderPlayground()};

export const PlanMode: StoryObj<typeof AgentChat> = {render: () => renderPlayground('plan')};

export const ClarificationQuestion: StoryObj<typeof AgentChat> = {
    render: () => <QuestionScenario />,
};

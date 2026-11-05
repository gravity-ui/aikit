import type {Meta, StoryObj} from '@storybook/react-webpack5';

import {ChatContentV2} from '..';
import {RunActivity} from '../../../organisms/RunActivity';

import MDXDocs from './Docs.mdx';

export default {
    title: 'templates/ChatContentV2',
    component: ChatContentV2,
    parameters: {docs: {page: MDXDocs}},
    decorators: [
        (Story) => (
            <div style={{height: 480, maxWidth: 560}}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof ChatContentV2>;
export const Playground: StoryObj<typeof ChatContentV2> = {
    args: {
        header: <h3>Conversation</h3>,
        composer: <textarea aria-label="Message" style={{width: '100%'}} />,
        children: (
            <>
                {Array.from({length: 30}, (_, index) => (
                    <p key={index}>Message {index + 1}</p>
                ))}
                <RunActivity
                    id="run"
                    state="completed"
                    durationMs={3000}
                    steps={[
                        {
                            id: 'tool',
                            kind: 'tool',
                            props: {toolName: 'Read', bodyContent: <p>File contents</p>},
                        },
                    ]}
                />
            </>
        ),
    },
};

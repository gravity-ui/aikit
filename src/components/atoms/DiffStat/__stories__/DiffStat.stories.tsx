import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {DiffStat} from '..';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

type DiffStatProps = React.ComponentProps<typeof DiffStat>;

export default {
    title: 'atoms/DiffStat',
    component: DiffStat,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        added: {
            control: 'number',
            description: 'Number of added lines',
        },
        deleted: {
            control: 'number',
            description: 'Number of deleted lines',
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

type Story = StoryObj<typeof DiffStat>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<DiffStatProps> = (args) => <DiffStat {...args} />;
Playground.args = {
    added: 10,
    deleted: 5,
};

export const Lengths: StoryObj<typeof DiffStat> = {
    render: () => (
        <>
            <ShowcaseItem title="Digits">
                <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <DiffStat added={0} deleted={0} />
                    <DiffStat added={0} deleted={1} />
                    <DiffStat added={1} deleted={0} />
                    <DiffStat added={1} deleted={1} />
                    <DiffStat added={5} deleted={3} />
                    <DiffStat added={9} deleted={9} />
                </div>
            </ShowcaseItem>
            <ShowcaseItem title="Tens">
                <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <DiffStat added={10} deleted={0} />
                    <DiffStat added={0} deleted={10} />
                    <DiffStat added={10} deleted={10} />
                    <DiffStat added={25} deleted={15} />
                    <DiffStat added={50} deleted={30} />
                    <DiffStat added={99} deleted={99} />
                </div>
            </ShowcaseItem>
            <ShowcaseItem title="Hundreds">
                <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <DiffStat added={100} deleted={0} />
                    <DiffStat added={0} deleted={100} />
                    <DiffStat added={100} deleted={100} />
                    <DiffStat added={250} deleted={150} />
                    <DiffStat added={500} deleted={300} />
                    <DiffStat added={999} deleted={999} />
                </div>
            </ShowcaseItem>
            <ShowcaseItem title="Thousands">
                <div style={{display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <DiffStat added={1000} deleted={0} />
                    <DiffStat added={0} deleted={1000} />
                    <DiffStat added={1000} deleted={1000} />
                    <DiffStat added={2500} deleted={1500} />
                    <DiffStat added={5000} deleted={3000} />
                    <DiffStat added={12345} deleted={6789} />
                </div>
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

import {Meta, StoryFn, StoryObj} from '@storybook/react';

import {ChatDate, ChatDateProps} from '..';
import {RELATIVE_DATE_THRESHOLD} from '../../../../constants';
import {Showcase} from '../../../../demo/Showcase';
import {ShowcaseItem} from '../../../../demo/ShowcaseItem';

import MDXDocs from './Docs.mdx';

export default {
    title: 'atoms/ChatDate',
    component: ChatDate,
    parameters: {
        docs: {
            page: MDXDocs,
        },
    },
    argTypes: {
        date: {
            control: 'text',
            description: 'Date value in string, Date, or number (timestamp) format',
        },
        format: {
            control: 'text',
            description: 'Custom format string (dayjs format)',
        },
        className: {
            control: 'text',
            description: 'Additional CSS class',
        },
        qa: {
            control: 'text',
            description: 'QA/test identifier',
        },
        locale: {
            control: 'text',
            description: 'Locale for date formatting',
        },
        relative: {
            control: 'boolean',
            description: 'Display relative dates (today, yesterday, two days ago, etc.)',
        },
    },
} as Meta;

type Story = StoryObj<typeof ChatDate>;

const defaultDecorators = [
    (Story) => (
        <Showcase>
            <Story />
        </Showcase>
    ),
] satisfies Story['decorators'];

export const Playground: StoryFn<ChatDateProps> = (args) => <ChatDate {...args} />;
Playground.args = {
    date: new Date().toISOString(),
};

export const DateString: StoryFn<ChatDateProps> = (args) => (
    <ChatDate {...args} date="2024-01-15T10:30:00Z" />
);

export const DateObject: StoryFn<ChatDateProps> = (args) => (
    <ChatDate {...args} date={new Date(2024, 0, 15, 10, 30)} />
);

export const Timestamp: StoryFn<ChatDateProps> = (args) => (
    <ChatDate {...args} date={1705312200000} />
);

export const WithTime: StoryFn<ChatDateProps> = (args) => (
    <ChatDate {...args} date="2024-01-15T10:30:00Z" showTime />
);

export const CustomFormat: StoryFn<ChatDateProps> = (args) => (
    <ChatDate {...args} date="2024-01-15T10:30:00Z" format="DD/MM/YYYY" />
);

export const CustomFormatWithTime: StoryFn<ChatDateProps> = (args) => (
    <ChatDate {...args} date="2024-01-15T10:30:00Z" format="DD/MM/YYYY HH:mm" showTime />
);

export const DifferentFormats: StoryObj<ChatDateProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="Default">
                <ChatDate {...args} date="2024-01-15T10:30:00Z" />
            </ShowcaseItem>
            <ShowcaseItem title="DD/MM/YYYY">
                <ChatDate {...args} date="2024-01-15T10:30:00Z" format="DD/MM/YYYY" />
            </ShowcaseItem>
            <ShowcaseItem title="MM-DD-YYYY">
                <ChatDate {...args} date="2024-01-15T10:30:00Z" format="MM-DD-YYYY" />
            </ShowcaseItem>
            <ShowcaseItem title="YYYY/MM/DD HH-mm">
                <ChatDate
                    {...args}
                    date="2024-01-15T10:30:00Z"
                    format="YYYY/MM/DD HH-mm"
                    showTime
                />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

export const DifferentDateTypes: StoryObj<ChatDateProps> = {
    render: (args) => (
        <>
            <ShowcaseItem title="ISO String">
                <ChatDate {...args} date="2024-01-15T10:30:00Z" />
            </ShowcaseItem>
            <ShowcaseItem title="Date Object">
                <ChatDate {...args} date={new Date(2024, 0, 15, 10, 30)} />
            </ShowcaseItem>
            <ShowcaseItem title="Timestamp">
                <ChatDate {...args} date={1705312200000} />
            </ShowcaseItem>
        </>
    ),
    decorators: defaultDecorators,
};

export const RecentDates: StoryObj<ChatDateProps> = {
    render: (args) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const getTitle = (daysAgo: number) => {
            return daysAgo ? `[ + ${daysAgo} ]` : `[ 0 ]`;
        };

        return (
            <>
                {Array.from({length: RELATIVE_DATE_THRESHOLD + 1}, (_, i) => {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    return (
                        <ShowcaseItem key={i} title={getTitle(i)}>
                            <ChatDate {...args} date={date} relative />
                        </ShowcaseItem>
                    );
                })}
            </>
        );
    },
    decorators: defaultDecorators,
};

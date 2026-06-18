import React from 'react';

import {StoryObj} from '@storybook/react-webpack5';

import {MessageList, type MessageListProps} from '../../..';
import {ContentWrapper} from '../../../../../demo/ContentWrapper';
import {ShowcaseItem} from '../../../../../demo/ShowcaseItem';
import type {TMessageContent} from '../../../../../types/messages';
import {
    type MessageContentComponentProps,
    type MessageRendererRegistry,
    createMessageRendererRegistry,
    registerMessageRenderer,
} from '../../../../../utils/messageTypeRegistry';

import {defaultDecorators} from './shared';

interface ChartMessageData {
    chartData: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            color?: string;
        }>;
    };
    chartType: 'line' | 'bar' | 'pie';
}

type ChartMessageContent = TMessageContent<'chart', ChartMessageData>;

const ChartMessageView: React.FC<MessageContentComponentProps<ChartMessageContent>> = ({part}) => {
    const {chartData, chartType} = part.data;
    return (
        <div
            style={{
                padding: '16px',
                border: '1px solid var(--g-color-line-generic)',
                borderRadius: '8px',
                backgroundColor: 'var(--g-color-base-float)',
            }}
        >
            <div style={{marginBottom: '8px', fontWeight: 'bold'}}>Chart: {chartType}</div>
            <div style={{fontSize: '12px', color: 'var(--g-color-text-secondary)'}}>
                Labels: {chartData.labels.join(', ')}
            </div>
            <div style={{fontSize: '12px', color: 'var(--g-color-text-secondary)'}}>
                Datasets: {chartData.datasets.length}
            </div>
        </div>
    );
};

export const WithCustomMessageType: StoryObj<MessageListProps<ChartMessageContent>> = {
    render: (args) => {
        const customRegistry: MessageRendererRegistry = createMessageRendererRegistry();
        registerMessageRenderer<ChartMessageContent>(customRegistry, 'chart', {
            component: ChartMessageView,
        });

        return (
            <ShowcaseItem title="With Custom Message Type">
                <ContentWrapper width="480px">
                    <MessageList<ChartMessageContent>
                        {...args}
                        messages={[
                            {
                                id: 'user-1',
                                role: 'user',
                                timestamp: '2024-01-01T00:00:00Z',
                                content:
                                    'Hi! Can you show me the sales statistics for the first months of the year?',
                            },
                            {
                                id: 'assistant-1',
                                role: 'assistant',
                                timestamp: '2024-01-01T00:00:02Z',
                                content: [
                                    {
                                        type: 'text',
                                        data: {
                                            text: 'Sure! Here is a bar chart showing sales statistics by month. As you can see, February had the highest sales.',
                                        },
                                    },
                                    {
                                        type: 'chart',
                                        data: {
                                            chartData: {
                                                labels: ['January', 'February', 'March', 'April'],
                                                datasets: [
                                                    {
                                                        label: 'Sales',
                                                        data: [12, 19, 3, 5],
                                                        color: '#0077ff',
                                                    },
                                                ],
                                            },
                                            chartType: 'bar',
                                        },
                                    },
                                ],
                            },
                        ]}
                        messageRendererRegistry={customRegistry}
                    />
                </ContentWrapper>
            </ShowcaseItem>
        );
    },
    decorators: defaultDecorators,
};

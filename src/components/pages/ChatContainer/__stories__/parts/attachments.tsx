import {useState} from 'react';

import {ChatContainer} from '../..';
import {useFileUploadStore} from '../../../../../hooks/useFileUploadStore';
import type {ChatStatus, TChatMessage, TSubmitData} from '../../../../../types';
import {FileIcon} from '../../../../atoms/FileIcon';
import {type ContextItemConfig} from '../../../../molecules/PromptInputHeader';
import {AttachmentPicker} from '../../../../organisms/AttachmentPicker';

import {type Story, defaultDecorators} from './shared';

function storyFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
    });
}

// Gradient SVG used as mock image attachment in stories
const MOCK_IMAGE_DATA_URL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjYmcpIi8+PGNpcmNsZSBjeD0iMTQwIiBjeT0iMTMwIiByPSI0MCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOSIvPjxwb2x5Z29uIHBvaW50cz0iMjIwLDE4MCAyOTAsMjQwIDE1MCwyNDAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciLz48cmVjdCB4PSIyNTAiIHk9IjgwIiB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHJ4PSI4IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+';

const messagesWithFileAttachments: TChatMessage[] = [
    {
        id: 'fa-1',
        role: 'user',
        content: 'Can you analyze this image and the attached PDF?',
        images: [MOCK_IMAGE_DATA_URL],
        fileAttachments: [{id: 'pdf-1', name: 'report.pdf', mimeType: 'application/pdf'}],
    },
    {
        id: 'fa-2',
        role: 'assistant',
        content:
            'I can see the image you attached — it appears to be a gradient illustration with geometric shapes. Regarding `report.pdf`, I would need its content to analyze it further.\n\nWhat specific aspects would you like me to focus on?',
    },
    {
        id: 'fa-3',
        role: 'user',
        content: 'Here are two more screenshots to compare.',
        images: [MOCK_IMAGE_DATA_URL, MOCK_IMAGE_DATA_URL],
    },
    {
        id: 'fa-4',
        role: 'assistant',
        content:
            'Both screenshots share the same purple-to-indigo gradient background with white geometric overlays. The composition includes a circle in the upper-left area, a triangle in the center-right, and a rounded rectangle in the top-right corner.',
    },
    {
        id: 'fa-5',
        role: 'user',
        content: 'Thanks! Also attaching some spreadsheets for reference.',
        fileAttachments: [
            {id: 'xlsx-1', name: 'data.xlsx', mimeType: 'application/vnd.ms-excel'},
            {id: 'csv-1', name: 'summary.csv', mimeType: 'text/csv'},
        ],
    },
    {
        id: 'fa-6',
        role: 'assistant',
        content:
            'Got it! I can see two files attached: `data.xlsx` and `summary.csv`. Please share their content or describe what analysis you need, and I will help you right away.',
    },
];

/**
 * Messages that include image attachments (rendered as inline previews)
 * and file attachment chips. Demonstrates multimodal conversation flow.
 */
export const WithFileAttachments: Story = {
    args: {
        messages: messagesWithFileAttachments,
        showActionsOnHover: true,
    },
    render: (args) => {
        const [messages, setMessages] = useState<TChatMessage[]>(args.messages || []);
        const [status, setStatus] = useState<ChatStatus>('ready');

        const handleSendMessage = async (data: TSubmitData) => {
            const userMessage: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
                ...(data.attachments && data.attachments.length > 0
                    ? {
                          fileAttachments: data.attachments.map((f, i) => ({
                              id: `new-${i}`,
                              name: f.name,
                              mimeType: f.type || undefined,
                          })),
                      }
                    : {}),
            };
            setMessages((prev) => [...prev, userMessage]);
            setStatus('streaming');
            await new Promise((resolve) => setTimeout(resolve, 800));
            const reply: TChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Mock reply to: "${data.content}"`,
            };
            setMessages((prev) => [...prev, reply]);
            setStatus('ready');
        };

        return (
            <ChatContainer
                {...args}
                messages={messages}
                status={status}
                onSendMessage={handleSendMessage}
            />
        );
    },
    decorators: defaultDecorators,
};

/**
 * Demonstrates live file attachment via the input area.
 * Click the paperclip icon to open the upload dialog and select files.
 * Images are shown as inline previews in both the dialog and the sent message;
 * other file types appear as chips.
 */
export const WithAttachmentInput: Story = {
    render: () => {
        const [messages, setMessages] = useState<TChatMessage[]>([]);
        const [status, setStatus] = useState<ChatStatus>('ready');
        const {entries, addFiles, removeFile, reset} = useFileUploadStore<{
            id: string;
            name: string;
            mimeType?: string;
        }>({
            upload: async (file) => {
                await new Promise((r) => setTimeout(r, 300));
                return {id: `mock-${file.name}`, name: file.name, mimeType: file.type || undefined};
            },
        });

        const handleSendMessage = async (data: TSubmitData) => {
            const allFiles = [...entries.map((e) => e.file), ...(data.attachments ?? [])];
            reset();

            const imageFiles = allFiles.filter((f) => f.type.startsWith('image/'));
            const otherFiles = allFiles.filter((f) => !f.type.startsWith('image/'));
            const base64Images = await Promise.all(imageFiles.map(storyFileToBase64));
            const fileAttachments = otherFiles.map((f, i) => ({
                id: `att-${Date.now()}-${i}`,
                name: f.name,
                mimeType: f.type || undefined,
            }));

            const userMsg: TChatMessage = {
                id: Date.now().toString(),
                role: 'user',
                content: data.content,
                images: base64Images.length > 0 ? base64Images : undefined,
                fileAttachments: fileAttachments.length > 0 ? fileAttachments : undefined,
            };
            setMessages((prev) => [...prev, userMsg]);
            setStatus('streaming');
            await new Promise((r) => setTimeout(r, 800));

            const fileList = allFiles.map((f) => `\`${f.name}\``).join(', ');
            const replyMsg: TChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content:
                    allFiles.length > 0
                        ? `I received ${allFiles.length} file(s): ${fileList}.${data.content ? ` You also wrote: "${data.content}".` : ''}`
                        : `Mock reply to: "${data.content}"`,
            };
            setMessages((prev) => [...prev, replyMsg]);
            setStatus('ready');
        };

        const contextItems: ContextItemConfig[] = entries.map((entry) => ({
            id: entry.id,
            content: (
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
                    <FileIcon
                        fileName={entry.file.name}
                        mimeType={entry.file.type || undefined}
                        size="s"
                    />
                    {entry.file.name}
                </span>
            ),
            onRemove: () => removeFile(entry.id),
        }));

        const attachmentPicker = (
            <AttachmentPicker
                uploadOnly
                fileDialogProps={{
                    title: 'Attach files',
                    multiple: true,
                    onCancel: reset,
                    onAdd: addFiles,
                    files: entries.map((entry) => ({
                        id: entry.id,
                        name: entry.file.name,
                        size: entry.file.size,
                        mimeType: entry.file.type || undefined,
                        status: (() => {
                            if (entry.status === 'uploading') return 'loading';
                            if (entry.status === 'done') return 'success';
                            if (entry.status === 'error') return 'error';
                            return undefined;
                        })(),
                        onRemove: () => removeFile(entry.id),
                    })),
                }}
            />
        );

        return (
            <ChatContainer
                messages={messages}
                status={status}
                onSendMessage={handleSendMessage}
                promptInputProps={{
                    view: 'full',
                    headerProps: {
                        contextItems,
                    },
                    footerProps: {
                        attachmentContent: attachmentPicker,
                    },
                }}
            />
        );
    },
    decorators: defaultDecorators,
};

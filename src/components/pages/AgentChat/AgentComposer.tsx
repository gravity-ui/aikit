import {useRef, useState} from 'react';

import {Button, Flex, Icon, Text} from '@gravity-ui/uikit';

import type {ChatStatus, TSubmitData} from '../../../types';
import {PromptInputFull} from '../../organisms/PromptInput/PromptInputFull';
import type {UsePromptInputReturn} from '../../organisms/PromptInput/usePromptInput';

import type {ModelItem} from './controls/shared/types/models';
import {AssistantModelSelect} from './controls/ui/components/AssistantModelSelect/AssistantModelSelect';
import {SelectPopup} from './controls/ui/components/SelectPopup/SelectPopup';
import {AgentRepoSelect} from './controls/ui/modules/agent/components/AgentRepoSelect/AgentRepoSelect';
import {SkillsAutocompletePopup} from './controls/ui/modules/agent/components/SkillsAutocompletePopup/SkillsAutocompletePopup';

const slashIcon =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M10.5 1.25C12.8472 1.25 14.75 3.15279 14.75 5.5V10.5C14.75 12.8472 12.8472 14.75 10.5 14.75H5.5C3.15279 14.75 1.25 12.8472 1.25 10.5V5.5C1.25 3.15279 3.15279 1.25 5.5 1.25H10.5ZM5.5 2.75C3.98122 2.75 2.75 3.98122 2.75 5.5V10.5C2.75 12.0188 3.98122 13.25 5.5 13.25H10.5C12.0188 13.25 13.25 12.0188 13.25 10.5V5.5C13.25 3.98122 12.0188 2.75 10.5 2.75H5.5ZM8.07129 5.12891C8.27636 4.61624 8.85839 4.36642 9.37109 4.57129C9.88377 4.77636 10.1336 5.35839 9.92871 5.87109L7.92871 10.8711C7.72364 11.3838 7.14161 11.6336 6.62891 11.4287C6.11623 11.2236 5.86642 10.6416 6.07129 10.1289L8.07129 5.12891Z" fill="currentColor"/>\n</svg>\n\n';

export function AgentComposer({
    status,
    onSend,
    onStop,
    models,
    skills,
    repositories,
    repository,
    onRepositoryChange,
    model,
    onModelChange,
    modelLabel,
}: {
    models: ModelItem[];
    skills: Array<{slug: string; title?: string}>;
    repositories: Array<{orgSlug: string; slug: string}>;
    repository: {orgSlug: string; repoSlug: string};
    onRepositoryChange: (repository: {orgSlug: string; repoSlug: string}) => void;
    model: string;
    modelLabel?: string;
    onModelChange: (model: string) => void;
    status: ChatStatus;
    onSend: (data: TSubmitData) => Promise<void>;
    onStop: () => void;
}) {
    const [input, setInput] = useState('');
    const [skillsOpen, setSkillsOpen] = useState(false);
    const [typedSkills, setTypedSkills] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const busy = ['submitted', 'streaming', 'streaming_loading'].includes(status);
    const query = typedSkills ? input.match(/(?:^|\s)\/([^\s]*)$/)?.[1] || '' : '';
    const visibleSkills = skills.filter((skill) => skill.slug.includes(query));
    const selectSkill = (skill: (typeof skills)[number]) => {
        const caret = inputRef.current?.selectionStart ?? input.length;
        const start = typedSkills ? input.lastIndexOf('/', caret) : caret;
        setInput(input.slice(0, start) + `/${skill.slug} ` + input.slice(caret));
        setSkillsOpen(false);
        setTypedSkills(false);
        inputRef.current?.focus();
    };
    const submit = async () => {
        if (busy) {
            onStop();
            return;
        }
        if (!input.trim()) return;
        const content = input;
        setInput('');
        setSkillsOpen(false);
        setTypedSkills(false);
        onSend({content});
    };
    const idleSubmitState = input.trim() ? 'enabled' : 'disabled';
    const hookState = {
        value: input,
        handleChange: (value: string) => {
            setInput(value);
            setTypedSkills(/(?:^|\s)\/[^\s]*$/.test(value));
            setSelectedIndex(0);
        },
        handleSubmit: submit,
        handleKeyDown: (event: React.KeyboardEvent) => {
            if (typedSkills && visibleSkills.length) {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.preventDefault();
                    setSelectedIndex(
                        (index) =>
                            (index + (event.key === 'ArrowDown' ? 1 : visibleSkills.length - 1)) %
                            visibleSkills.length,
                    );
                    return;
                }
                if (event.key === 'Escape') {
                    event.preventDefault();
                    setTypedSkills(false);
                    return;
                }
                if (event.key === 'Enter' || event.key === 'Tab') {
                    event.preventDefault();
                    selectSkill(visibleSkills[selectedIndex]);
                    return;
                }
            }
            if (event.key === 'Enter' && !event.shiftKey && !event.metaKey) {
                event.preventDefault();
                if (!busy) submit();
            }
        },
        submitButtonState: busy ? 'cancelable' : idleSubmitState,
    } as unknown as UsePromptInputReturn;
    return (
        <div className="agent-chat__agent-footer">
            <div ref={wrapperRef} className="agent-chat__agent-autocomplete">
                <PromptInputFull
                    className="agent-chat__agent-input"
                    hookState={hookState}
                    headerProps={{
                        contextItems: [
                            {
                                id: 'repository',
                                content: (
                                    <AgentRepoSelect
                                        {...repository}
                                        repositories={repositories}
                                        onRepoSelectionChange={onRepositoryChange}
                                    />
                                ),
                            },
                        ],
                    }}
                    bodyProps={{
                        placeholder: 'Plan, code, build and test anything',
                        minRows: 1,
                        maxRows: 10,
                        autoFocus: true,
                        inputRef,
                    }}
                    footerProps={{
                        submitButtonCancelableText: 'Stop',
                        submitButtonTooltipSend: 'Send',
                        submitButtonTooltipCancel: 'Stop',
                        submitButtonQa: busy
                            ? 'agent-chat-input-stop-button'
                            : 'agent-chat-input-send-button',
                        bottomContent: (
                            <Flex width="100%" alignItems="center" gap="2">
                                <AssistantModelSelect
                                    size="m"
                                    models={models}
                                    selectedModelId={model}
                                    selectedModelLabel={
                                        modelLabel ??
                                        models.find((item) => item.id === model)?.name ??
                                        model
                                    }
                                    onSelect={onModelChange}
                                    header={
                                        <SelectPopup.Header>
                                            <Text variant="subheader-2">Select model</Text>
                                        </SelectPopup.Header>
                                    }
                                />
                                <Flex style={{flexGrow: 1}} justifyContent="flex-end">
                                    <Button
                                        ref={buttonRef}
                                        view="flat-secondary"
                                        size="m"
                                        onClick={() => setSkillsOpen((open) => !open)}
                                        selected={skillsOpen}
                                        qa="skill-autocomplete-button"
                                    >
                                        <Icon data={slashIcon} size={16} />
                                    </Button>
                                </Flex>
                            </Flex>
                        ),
                    }}
                    qa="agent-chat-input"
                />
                {(skillsOpen || typedSkills) && (
                    <SkillsAutocompletePopup
                        skills={typedSkills ? visibleSkills : skills}
                        selectedIndex={selectedIndex}
                        anchorElement={skillsOpen ? buttonRef.current : wrapperRef.current}
                        onSelect={selectSkill}
                        onClose={() => {
                            setSkillsOpen(false);
                            setTypedSkills(false);
                        }}
                        placement={skillsOpen ? 'bottom-end' : 'top-start'}
                        withSearch={skillsOpen}
                    />
                )}
            </div>
        </div>
    );
}

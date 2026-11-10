import {useRef, useState} from 'react';

import {Button, Flex, Icon, Text, useLayoutEffect} from '@gravity-ui/uikit';

import type {ChatStatus, TSubmitData} from '../../../types';
import {PromptInputFull} from '../../organisms/PromptInput/PromptInputFull';
import {usePromptInput} from '../../organisms/PromptInput/usePromptInput';

import {AssistantModelSelect} from './controls/ui/components/AssistantModelSelect/AssistantModelSelect';
import {SelectPopup} from './controls/ui/components/SelectPopup/SelectPopup';
import {AgentRepoSelect} from './controls/ui/modules/agent/components/AgentRepoSelect/AgentRepoSelect';
import {SkillsAutocompletePopup} from './controls/ui/modules/agent/components/SkillsAutocompletePopup/SkillsAutocompletePopup';
import {i18n} from './i18n';
import type {AgentModelOption} from './types';

const slashIcon =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M10.5 1.25C12.8472 1.25 14.75 3.15279 14.75 5.5V10.5C14.75 12.8472 12.8472 14.75 10.5 14.75H5.5C3.15279 14.75 1.25 12.8472 1.25 10.5V5.5C1.25 3.15279 3.15279 1.25 5.5 1.25H10.5ZM5.5 2.75C3.98122 2.75 2.75 3.98122 2.75 5.5V10.5C2.75 12.0188 3.98122 13.25 5.5 13.25H10.5C12.0188 13.25 13.25 12.0188 13.25 10.5V5.5C13.25 3.98122 12.0188 2.75 10.5 2.75H5.5ZM8.07129 5.12891C8.27636 4.61624 8.85839 4.36642 9.37109 4.57129C9.88377 4.77636 10.1336 5.35839 9.92871 5.87109L7.92871 10.8711C7.72364 11.3838 7.14161 11.6336 6.62891 11.4287C6.11623 11.2236 5.86642 10.6416 6.07129 10.1289L8.07129 5.12891Z" fill="currentColor"/>\n</svg>\n\n';

function getSlashCommand(value: string, start: number, end: number) {
    if (start !== end || (start < value.length && !/\s/.test(value[start]))) {
        return undefined;
    }
    const match = value.slice(0, start).match(/(?:^|\s)\/([^\s/]*)$/);
    if (!match) {
        return undefined;
    }
    return {start: start - match[1].length - 1, end: start, query: match[1]};
}

/** @experimental May change or be removed in minor releases. */
export interface AgentComposerProps {
    models: AgentModelOption[];
    skills: Array<{slug: string; title?: string}>;
    repositories: Array<{orgSlug: string; slug: string}>;
    repository: {orgSlug: string; repoSlug: string};
    onRepositoryChange: (repository: {orgSlug: string; repoSlug: string}) => void;
    model: string;
    modelLabel?: string;
    onModelChange: (model: string) => void;
    status: ChatStatus;
    onSend: (data: TSubmitData) => Promise<void | false>;
    onStop: () => void;
    /** Scope draft recovery to the active conversation. */
    resetKey?: string | number;
}

/** @experimental May change or be removed in minor releases. */
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
    resetKey,
}: AgentComposerProps) {
    const {t} = i18n.useTranslation();
    const [skillsOpen, setSkillsOpen] = useState(false);
    const [typedSkills, setTypedSkills] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selection, setSelection] = useState({start: 0, end: 0});
    const pendingCaret = useRef<number>();
    const lastSelection = useRef({value: '', start: 0, end: 0});
    const buttonRef = useRef<HTMLButtonElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const prompt = usePromptInput({
        status,
        resetKey,
        onCancel: async () => {
            onStop();
        },
        onSend: async (data) => {
            setSkillsOpen(false);
            setTypedSkills(false);
            return onSend(data);
        },
    });
    const {value: input, handleChange: setInput} = prompt;
    const busy = ['submitted', 'streaming', 'streaming_loading'].includes(status);
    const command = typedSkills
        ? getSlashCommand(input, selection.start, selection.end)
        : undefined;
    const visibleSkills = skills.filter((skill) => skill.slug.includes(command?.query ?? ''));
    useLayoutEffect(() => {
        if (pendingCaret.current !== undefined) {
            inputRef.current?.focus();
            inputRef.current?.setSelectionRange(pendingCaret.current, pendingCaret.current);
            pendingCaret.current = undefined;
        }
    });
    const updateSelection = (value: string) => {
        const start = inputRef.current?.selectionStart ?? value.length;
        const end = inputRef.current?.selectionEnd ?? start;
        const previous = lastSelection.current;
        if (previous.value === value && previous.start === start && previous.end === end) {
            return;
        }
        lastSelection.current = {value, start, end};
        setSelection({start, end});
        setTypedSkills(Boolean(getSlashCommand(value, start, end)));
        setSelectedIndex(0);
    };
    const selectSkill = (skill: (typeof skills)[number]) => {
        const caret = inputRef.current?.selectionStart ?? input.length;
        const end = inputRef.current?.selectionEnd ?? caret;
        const currentCommand = getSlashCommand(input, caret, end);
        if (typedSkills && !skillsOpen && !currentCommand) {
            setTypedSkills(false);
            return;
        }
        const start = typedSkills && !skillsOpen && currentCommand ? currentCommand.start : caret;
        const replacement = `/${skill.slug} `;
        pendingCaret.current = start + replacement.length;
        setInput(input.slice(0, start) + replacement + input.slice(end));
        setSkillsOpen(false);
        setTypedSkills(false);
    };
    const hookState = {
        ...prompt,
        handleChange: (value: string) => {
            setInput(value);
            updateSelection(value);
        },
        handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.nativeEvent.isComposing || event.defaultPrevented) {
                return;
            }
            const currentCommand = getSlashCommand(
                input,
                event.currentTarget.selectionStart,
                event.currentTarget.selectionEnd,
            );
            if (typedSkills && currentCommand && visibleSkills.length) {
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
                    selectSkill(visibleSkills[selectedIndex % visibleSkills.length]);
                    return;
                }
            }
            if (
                busy &&
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.ctrlKey &&
                !event.metaKey
            ) {
                event.preventDefault();
                return;
            }
            prompt.handleKeyDown(event);
        },
    };
    return (
        <div className="agent-chat__agent-footer">
            <div ref={wrapperRef} className="agent-chat__agent-autocomplete">
                {prompt.sendError && (
                    <Text color="danger" role="alert">
                        {t('send-error')}
                    </Text>
                )}
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
                        placeholder: t('placeholder'),
                        minRows: 1,
                        maxRows: 10,
                        autoFocus: true,
                        inputRef,
                        controlProps: {
                            onSelect: () => updateSelection(input),
                        },
                    }}
                    footerProps={{
                        submitButtonCancelableText: t('stop'),
                        submitButtonTooltipSend: t('send'),
                        submitButtonTooltipCancel: t('stop'),
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
                                            <Text variant="subheader-2">{t('select-model')}</Text>
                                        </SelectPopup.Header>
                                    }
                                />
                                <Flex style={{flexGrow: 1}} justifyContent="flex-end">
                                    <Button
                                        ref={buttonRef}
                                        aria-label={t('select-skill')}
                                        view="flat-secondary"
                                        size="m"
                                        onClick={() => {
                                            setTypedSkills(false);
                                            setSkillsOpen((open) => !open);
                                        }}
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
                {(skillsOpen || command) && (
                    <SkillsAutocompletePopup
                        skills={skillsOpen ? skills : visibleSkills}
                        selectedIndex={skillsOpen ? undefined : selectedIndex}
                        onSelectedIndexChange={setSelectedIndex}
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

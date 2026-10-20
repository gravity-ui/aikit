import {useEffect, useRef} from 'react';
import type {RefObject} from 'react';

import {Button, Popup, TextInput} from '@gravity-ui/uikit';

import type {PromptCommandsConfig} from '../../../types';
import {block} from '../../../utils/cn';
import {PromptInputHeader} from '../../molecules/PromptInputHeader';

import {i18n} from './i18n';
import type {usePromptCommands} from './usePromptCommands';

const b = block('prompt-input');

export function PromptInputCommands({
    commands,
    config,
    inputRef,
    disabled,
}: {
    commands: ReturnType<typeof usePromptCommands>;
    config: PromptCommandsConfig;
    inputRef: RefObject<HTMLTextAreaElement>;
    disabled: boolean;
}) {
    const listRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        listRef.current
            ?.querySelector('[aria-selected="true"]')
            ?.scrollIntoView({block: 'nearest'});
    }, [commands.activeIndex]);
    const optionId = (index: number) => `${commands.listId}-${index}`;
    return (
        <>
            {commands.selections.length > 0 && (
                <PromptInputHeader
                    contextItems={commands.selections.map((item) => ({
                        id: JSON.stringify([item.sourceId, item.id]),
                        content: item.title,
                        onRemove: disabled ? undefined : () => commands.remove(item),
                    }))}
                />
            )}
            {config.sources.some((source) => source.buttonLabel) && (
                <div className={b('command-buttons')}>
                    {config.sources
                        .filter((source) => source.buttonLabel)
                        .map((source) => (
                            <Button
                                key={source.id}
                                size="s"
                                view="flat"
                                disabled={disabled}
                                onClick={() => commands.openSource(source.id)}
                            >
                                {source.buttonLabel}
                            </Button>
                        ))}
                </div>
            )}
            <Popup
                open={commands.open}
                anchorRef={inputRef}
                placement={['top-start', 'bottom-start']}
                onClose={commands.close}
            >
                <div className={b('commands')}>
                    <div className={b('commands-title')}>{commands.source?.title}</div>
                    {commands.session?.origin === 'button' && (
                        <TextInput
                            autoFocus
                            value={commands.session.query}
                            onUpdate={commands.search}
                            placeholder={i18n('search')}
                            onKeyDown={commands.handleKeyDown}
                            controlProps={{
                                role: 'combobox',
                                'aria-label': commands.source?.title,
                                'aria-expanded': true,
                                'aria-controls': commands.listId,
                                'aria-autocomplete': 'list',
                                'aria-activedescendant': commands.items[commands.activeIndex]
                                    ? optionId(commands.activeIndex)
                                    : undefined,
                            }}
                        />
                    )}
                    {commands.loading && <div role="status">{i18n('loading')}</div>}
                    {commands.error && (
                        <div role="alert">
                            {i18n('error')}{' '}
                            <Button size="s" onClick={commands.retry}>
                                {i18n('retry')}
                            </Button>
                        </div>
                    )}
                    {!commands.loading && !commands.error && commands.items.length === 0 && (
                        <div role="status">{i18n('empty')}</div>
                    )}
                    <div
                        ref={listRef}
                        id={commands.listId}
                        role="listbox"
                        aria-label={commands.source?.title}
                        className={b('command-list')}
                    >
                        {commands.items.map((item, index) => (
                            <div
                                key={item.id}
                                id={optionId(index)}
                                role="option"
                                aria-selected={index === commands.activeIndex}
                                aria-disabled={item.disabled}
                                className={b('command', {
                                    active: index === commands.activeIndex,
                                    disabled: item.disabled,
                                })}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => commands.select(item)}
                            >
                                {item.icon && <span>{item.icon}</span>}
                                <div>
                                    <div>{item.title}</div>
                                    {item.description && (
                                        <div className={b('command-description')}>
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Popup>
        </>
    );
}

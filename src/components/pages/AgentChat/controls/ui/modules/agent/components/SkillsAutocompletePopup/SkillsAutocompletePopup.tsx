import {useMemo, useState} from 'react';

import {Magnifier} from '@gravity-ui/icons';
import {ListItemView, Popup, type PopupPlacement, Text, TextInput} from '@gravity-ui/uikit';

import {cn} from '../../../../../classNames';
import type {AgentSkill} from '../../../../../types';
import {InputIcon} from '../../../../components/InputIcon/index';
import {List} from '../../../../components/List/index';
import {i18n} from '../../i18n';

import './SkillsAutocompletePopup.ported.scss';
const css = {
    item: 'g-aikit-agent-skills-autocomplete-popup__item',
    active: 'g-aikit-agent-skills-autocomplete-popup__active',
    wrapper: 'g-aikit-agent-skills-autocomplete-popup__wrapper',
    search: 'g-aikit-agent-skills-autocomplete-popup__search',
    list: 'g-aikit-agent-skills-autocomplete-popup__list',
    popup: 'g-aikit-agent-skills-autocomplete-popup__popup',
};

interface SkillsAutocompletePopupProps {
    skills: readonly AgentSkill[];
    selectedIndex?: number;
    onSelectedIndexChange?: (index: number) => void;
    anchorElement: HTMLElement | null;
    onSelect: (skill: AgentSkill) => void;
    onClose: () => void;
    placement?: PopupPlacement;
    withSearch?: boolean;
}

export function SkillsAutocompletePopup({
    skills,
    selectedIndex,
    onSelectedIndexChange,
    anchorElement,
    placement = 'top-start',
    onSelect,
    onClose,
    withSearch = false,
}: SkillsAutocompletePopupProps) {
    const {t} = i18n.useTranslation();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSkills = useMemo(() => {
        let skillsToShow = skills;

        if (withSearch && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            skillsToShow = skills.filter(
                (skill) =>
                    skill.slug.toLowerCase().includes(query) ||
                    skill.title?.toLowerCase().includes(query),
            );
        }

        return skillsToShow.map((s) => ({
            value: s.slug,
            text: s.title || s.slug,
            data: s,
        }));
    }, [skills, searchQuery, withSearch]);

    if (!anchorElement || skills.length === 0) {
        return null;
    }

    return (
        <Popup
            open
            placement={placement}
            anchorElement={anchorElement}
            offset={{mainAxis: 2}}
            strategy="fixed"
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            className={css.popup}
            qa="skills-autocomplete-popup"
        >
            <div className={css.wrapper}>
                {withSearch && (
                    <div className={css.search}>
                        <TextInput
                            value={searchQuery}
                            onUpdate={setSearchQuery}
                            placeholder={t('placeholder_search')}
                            hasClear
                            startContent={<InputIcon.Start data={Magnifier} />}
                            size="m"
                        />
                    </div>
                )}
                <div className={css.list}>
                    <List
                        aria-label="Skills"
                        items={filteredSkills}
                        getItemId={(item) => item.value}
                        getItemTextValue={(item) => item.value}
                        activeItemId={
                            selectedIndex === undefined
                                ? undefined
                                : (filteredSkills[selectedIndex]?.value ?? null)
                        }
                        onActiveItemUpdate={(id) => {
                            const index = filteredSkills.findIndex((item) => item.value === id);
                            if (index >= 0) {
                                onSelectedIndexChange?.(index);
                            }
                        }}
                        onItemAction={(_id, item) => onSelect(item.data)}
                        renderItem={({item, state}, helpers) => (
                            <ListItemView
                                {...helpers.getItemProps({
                                    className: cn(css.item, {[css.active]: state.active}),
                                    onMouseDown: (event) => event.preventDefault(),
                                })}
                                {...helpers.getItemViewProps()}
                                description={
                                    <Text variant="body-short" color="secondary" ellipsis>
                                        {item.text}
                                    </Text>
                                }
                            >
                                <Text variant="body-short" ellipsis>
                                    /{item.value}
                                </Text>
                            </ListItemView>
                        )}
                    />
                </div>
            </div>
        </Popup>
    );
}

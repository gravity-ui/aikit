import {type RefObject, useMemo, useState} from 'react';

import {Popup, type PopupPlacement, Text} from '@gravity-ui/uikit';

import {cn} from '../../../../../classNames';
import type {AgentSkill} from '../../../../../types';
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
    returnFocus?: RefObject<HTMLElement>;
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
    returnFocus,
    placement = 'top-start',
    onSelect,
    onClose,
    withSearch = false,
}: SkillsAutocompletePopupProps) {
    const {t} = i18n.useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

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
            returnFocus={returnFocus}
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
                <div className={css.list}>
                    <List
                        role="listbox"
                        virtualized={false}
                        deactivateOnLeave={false}
                        items={filteredSkills}
                        itemKey={(item) => item.value}
                        itemHeight={44}
                        filterable={withSearch}
                        autoFocus={withSearch}
                        filter={searchQuery}
                        filterPlaceholder={t('placeholder_search')}
                        filterClassName={css.search}
                        onFilterUpdate={(query) => {
                            setSearchQuery(query);
                            setActiveIndex(0);
                        }}
                        activeItemIndex={selectedIndex ?? activeIndex}
                        onChangeActive={(index) => {
                            if (index !== undefined) {
                                setActiveIndex(index);
                                onSelectedIndexChange?.(index);
                            }
                        }}
                        onItemClick={(item, _index, _fromKeyboard, event) => {
                            event?.preventDefault();
                            if (item) {
                                onSelect(item.data);
                            }
                        }}
                        renderItem={(item, active) => (
                            <div
                                className={cn(css.item, {[css.active]: active})}
                                onMouseDown={(event) => event.preventDefault()}
                            >
                                <Text variant="body-short" ellipsis>
                                    /{item.value}
                                </Text>
                                <Text variant="body-short" color="secondary" ellipsis>
                                    {item.text}
                                </Text>
                            </div>
                        )}
                    />
                </div>
            </div>
        </Popup>
    );
}

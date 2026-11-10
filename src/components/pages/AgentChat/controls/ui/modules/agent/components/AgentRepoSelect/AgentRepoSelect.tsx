import {useCallback, useMemo, useState} from 'react';

import {Archive, Xmark} from '@gravity-ui/icons';
import {Icon, Select, Skeleton} from '@gravity-ui/uikit';

import {type Repository} from '../../../../../types';
import {SelectPopup} from '../../../../components/SelectPopup/index';

import {i18n} from './i18n';

import './AgentRepoSelect.ported.scss';
const css = {
    select: 'g-aikit-agent-agent-repo-select__select',
    selectedOption: 'g-aikit-agent-agent-repo-select__selectedOption',
    filter: 'g-aikit-agent-agent-repo-select__filter',
    list: 'g-aikit-agent-agent-repo-select__list',
    repoIcon: 'g-aikit-agent-agent-repo-select__repoIcon',
    selectedLabel: 'g-aikit-agent-agent-repo-select__selectedLabel',
    skeleton: 'g-aikit-agent-agent-repo-select__skeleton',
};

export enum RepoSelectStatus {
    Disabled = 'disabled',
    Active = 'active',
    Loading = 'loading',
}

export interface IAgentRepoSelectProps {
    repositories: Repository[];
    orgSlug?: string;
    repoSlug?: string;
    onRepoSelectionChange: (repository: {orgSlug: string; repoSlug: string}) => void;
    status?: RepoSelectStatus;
}

export function AgentRepoSelect({
    status = RepoSelectStatus.Active,
    ...props
}: IAgentRepoSelectProps) {
    if (status === RepoSelectStatus.Loading) {
        return <Skeleton className={css.skeleton} qa="agent-repo-select-skeleton" />;
    }

    return <AgentRepoSelectControl {...props} disabled={status === RepoSelectStatus.Disabled} />;
}

function AgentRepoSelectControl({
    orgSlug,
    repositories,
    repoSlug,
    onRepoSelectionChange,
    disabled,
}: Omit<IAgentRepoSelectProps, 'status'> & {disabled: boolean}) {
    const {t} = i18n.useTranslation();
    const [filter, setFilter] = useState('');
    const [open, setOpen] = useState(false);
    const options = useMemo(
        () =>
            repositories
                .filter((repo) => repo.slug.includes(filter))
                .map((repo) => ({
                    value: `${repo.orgSlug}/${repo.slug}`,
                    content: repo.slug,
                    data: repo,
                })),
        [repositories, filter],
    );
    const value = useMemo(
        () => (orgSlug && repoSlug ? [`${orgSlug}/${repoSlug}`] : []),
        [orgSlug, repoSlug],
    );

    const handleOpenChange = useCallback((nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setFilter('');
        }
    }, []);

    const handleClear = useCallback(() => {
        if (disabled) {
            return;
        }
        onRepoSelectionChange({orgSlug: '', repoSlug: ''});
        handleOpenChange(false);
    }, [disabled, handleOpenChange, onRepoSelectionChange]);

    const handleSelect = useCallback(
        (nextValue: string[]) => {
            if (disabled) {
                return;
            }
            const repository = options.find((option) => option.value === nextValue[0])?.data;
            if (repository) {
                onRepoSelectionChange({orgSlug: repository.orgSlug, repoSlug: repository.slug});
            }
        },
        [disabled, onRepoSelectionChange, options],
    );

    const handleFilterChange = useCallback((nextFilter: string) => {
        setFilter(nextFilter);
    }, []);

    return (
        <Select<Repository>
            qa="agent-repo-select"
            className={css.select}
            size="s"
            width="auto"
            popupWidth={300}
            value={value}
            disabled={disabled}
            options={options}
            open={open && !disabled}
            filterable
            filter={filter}
            filterOption={() => true}
            filterPlaceholder={t('placeholder_search')}
            placeholder={t('placeholder_repository')}
            aria-label={t('label_repository')}
            title={repoSlug || t('placeholder_repository')}
            renderSelectedOption={() => (
                <span className={css.selectedOption}>
                    <Icon data={Archive} size={16} className={css.repoIcon} aria-hidden />
                    <span className={css.selectedLabel}>{repoSlug}</span>
                </span>
            )}
            renderEmptyOptions={() => (
                <SelectPopup.EmptyOptions>{t('empty_repositories')}</SelectPopup.EmptyOptions>
            )}
            renderPopup={({renderFilter, renderList}) => (
                <>
                    <div className={css.filter}>{renderFilter()}</div>
                    <div className={css.list}>{renderList()}</div>
                    <SelectPopup.Footer>
                        <SelectPopup.FooterButton
                            disabled={disabled || value.length === 0}
                            onClick={handleClear}
                        >
                            <Icon data={Xmark} size={16} aria-hidden />
                            {t('action_no_repository')}
                        </SelectPopup.FooterButton>
                    </SelectPopup.Footer>
                </>
            )}
            onFilterChange={handleFilterChange}
            onUpdate={handleSelect}
            onOpenChange={handleOpenChange}
        />
    );
}

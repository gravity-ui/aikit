import {intl} from '../../../../../adapters';

export const {t: i18n} = intl.createMessages({
    action_no_repository: {
        meta: {id: 'AgentRepoSelect.action_no_repository:gH3tN'},
        ru: 'Без репозитория',
        en: 'No repository',
    },
    label_repository: {
        meta: {id: 'AgentRepoSelect.label_repository:dTDjW'},
        ru: 'Репозиторий для следующего сообщения',
        en: 'Repository for the next message',
    },
    placeholder_repository: {
        meta: {id: 'AgentRepoSelect.placeholder_repository:qv4QV'},
        ru: 'Репозиторий',
        en: 'Repository',
    },
    placeholder_search: {
        meta: {id: 'AgentRepoSelect.placeholder_search:k1oyZ'},
        ru: 'Найти репозиторий',
        en: 'Find a repository',
    },
    empty_repositories: {
        meta: {id: 'AgentRepoSelect.empty_repositories:qmy3k'},
        ru: 'Репозитории не найдены',
        en: 'No repositories found',
    },
    error_repositories: {
        meta: {id: 'AgentRepoSelect.error_repositories:iY5Hy'},
        ru: 'Не удалось загрузить репозитории',
        en: 'Could not load repositories',
    },
});

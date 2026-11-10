import {addComponentKeysets} from '@gravity-ui/uikit/i18n';

export const i18n = addComponentKeysets(
    {
        en: {
            action_no_repository: 'No repository',
            label_repository: 'Repository for the next message',
            placeholder_repository: 'Repository',
            placeholder_search: 'Find a repository',
            empty_repositories: 'No repositories found',
            error_repositories: 'Could not load repositories',
        },
        ru: {
            action_no_repository: 'Без репозитория',
            label_repository: 'Репозиторий для следующего сообщения',
            placeholder_repository: 'Репозиторий',
            placeholder_search: 'Найти репозиторий',
            empty_repositories: 'Репозитории не найдены',
            error_repositories: 'Не удалось загрузить репозитории',
        },
    },
    'g-aikit.AgentChat.AgentRepoSelect',
);

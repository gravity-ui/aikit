import {addComponentKeysets} from '@gravity-ui/uikit/i18n';

export const i18n = addComponentKeysets(
    {
        en: {
            search: 'Search',
            'nothing-found': 'Nothing found',
            'items-found': 'Items found',
            placeholder: 'Plan, code, build and test anything',
            stop: 'Stop',
            send: 'Send',
            'select-model': 'Select model',
            'select-skill': 'Select skill',
            'send-error': 'Message was not sent. Your draft has been restored.',
        },
        ru: {
            search: 'Поиск',
            'nothing-found': 'Ничего не найдено',
            'items-found': 'Найдено',
            placeholder: 'Планируйте, пишите код и запускайте проверки',
            stop: 'Остановить',
            send: 'Отправить',
            'select-model': 'Выберите модель',
            'select-skill': 'Выберите навык',
            'send-error': 'Сообщение не отправлено. Черновик восстановлен.',
        },
    },
    'g-aikit.AgentChat',
);

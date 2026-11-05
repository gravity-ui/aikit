import {intl} from '../../../adapters';

export const {t: i18n} = intl.createMessages({
    tier_label_default: {
        meta: {id: 'AssistantModelTierIcon.tier_label_default:objSm'},
        ru: 'Стандарт',
        en: 'Default',
    },
    tier_label_economy: {
        meta: {id: 'AssistantModelTierIcon.tier_label_economy:ubY7s'},
        ru: 'Экономный',
        en: 'Economy',
    },
    tier_label_comfort: {
        meta: {id: 'AssistantModelTierIcon.tier_label_comfort:tmdnA'},
        ru: 'Комфортный',
        en: 'Comfort',
    },
    tier_label_max: {
        meta: {id: 'AssistantModelTierIcon.tier_label_max:eWqYa'},
        ru: 'Максимальный',
        en: 'Maximum',
    },
    tier_tooltip_default: {
        meta: {id: 'AssistantModelTierIcon.tier_tooltip_default:ibe43'},
        ru: 'Модель выбирается автоматически в зависимости от задачи',
        en: 'The model is selected automatically depending on the task',
    },
    tier_tooltip_economy: {
        meta: {id: 'AssistantModelTierIcon.tier_tooltip_economy:8imN2'},
        ru: 'Минимальный расход для повседневных задач',
        en: 'Minimal usage for everyday tasks',
    },
    tier_tooltip_comfort: {
        meta: {id: 'AssistantModelTierIcon.tier_tooltip_comfort:vVPXR'},
        ru: 'Баланс возможностей и расхода',
        en: 'A balance of capability and usage',
    },
    tier_tooltip_max: {
        meta: {id: 'AssistantModelTierIcon.tier_tooltip_max:ufWJd'},
        ru: 'Максимум возможностей для сложных задач',
        en: 'Maximum capability for complex tasks',
    },
});

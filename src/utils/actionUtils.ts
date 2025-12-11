import React from 'react';

import type {Action, ActionConfig} from '../types/common';

/**
 * Type guard для проверки, является ли action React элементом
 * @param action - Проверяемое значение
 * @returns true если action является React.ReactNode, false если это ActionConfig
 */
export function isReactNodeAction(action: Action): action is React.ReactNode {
    return React.isValidElement(action);
}

/**
 * Type guard для проверки, является ли action объектом конфигурации
 * @param action - Проверяемое значение
 * @returns true если action является ActionConfig, false если это React.ReactNode
 */
export function isActionConfig(action: Action): action is ActionConfig {
    return !React.isValidElement(action);
}

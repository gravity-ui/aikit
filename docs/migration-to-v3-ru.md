# Миграция на AIKit v3

[English](migration-to-v3.md) | [Русский](migration-to-v3-ru.md)

## Обзор

AIKit 3 переходит на `@gravity-ui/uikit` 8. Минимальная поддерживаемая версия UIKit — **8.0.0**, диапазон совместимости — `^8.0.0`. Обновляйте обе библиотеки вместе. React и React DOM **18 или 19** остаются поддерживаемыми. Для Node.js теперь требуется **20.19+ в ветке v20 либо 22.12+** (`^20.19.0 || >=22.12.0`).

Этот документ описывает переход с AIKit 2.28.0. Полный список изменений находится в [release notes v3](changelog-v3.md). При обновлении с более раннего v2 также прочитайте промежуточные версии в [CHANGELOG.md](../CHANGELOG.md).

## Краткий чек-лист

1. Обновите Node.js до поддерживаемой версии, а AIKit и UIKit — вместе. Проверьте совместимость остальных Gravity-пакетов с UIKit 8.
2. Используйте `Provider` в корне приложения. Вложенные `ThemeProvider` оставьте для локальной смены темы.
3. Замените размер `xxs` на `2xs` у контекстных чипов и в функциях выбора размера контролов.
4. Проверьте собственные стили и селекторы истории чатов и меню.
5. Перегенерируйте кастомные темы UIKit через Themer v2; проверьте светлую и тёмную темы.
6. Проверьте поиск, клавиатуру, закрепление/удаление чатов, меню, мобильные шторки, загрузку файлов, команды ввода и Mermaid при стриминге.

## Версия Node.js

Обновите Node.js в разработке, CI и SSR до **20.19+ в ветке v20 либо 22.12+**. Более ранние версии Node 20/22 и Node 21 больше не поддерживаются.

UIKit 8 экспортирует ColorPicker, который загружает ESM-зависимости цветов даже при CommonJS-импорте другого компонента, например `@gravity-ui/aikit/Header`. Поддержка `require(esm)` включена по умолчанию начиная с [Node 20.19](https://nodejs.org/en/blog/release/v20.19.0) и [Node 22.12](https://nodejs.org/en/blog/release/v22.12.0). Обработку CSS при SSR-импортах по-прежнему настраивает приложение.

## Зависимости

```sh
npm install @gravity-ui/aikit@^3.0.0 @gravity-ui/uikit@^8.0.0
npm ls @gravity-ui/aikit @gravity-ui/uikit
```

Минимум `^8.0.0` одинаков в `peerDependencies` и зависимостях для разработки. Приложение должно использовать одну совместимую копию UIKit, чтобы провайдеры и компоненты разделяли контексты. Сначала обновите библиотеки, которые требуют UIKit 7; не скрывайте конфликт через `--force` или `--legacy-peer-deps`.

Диапазоны остальных обязательных peers не меняются: `@gravity-ui/icons`, `@gravity-ui/i18n`, `@diplodoc/transform`, `highlight.js`, React и React DOM. Mermaid остаётся необязательной зависимостью и загружается только через переданный приложением loader.

## Провайдер приложения

В UIKit 8 смена темы отделена от конфигурации приложения. Замените корневой провайдер и перенесите в него язык, layout, настройки компонентов и мобильного режима:

```diff
-import {ThemeProvider, MobileProvider} from '@gravity-ui/uikit';
+import {Provider} from '@gravity-ui/uikit';

-<ThemeProvider theme="light" lang="ru">
-  <MobileProvider mobile={isMobile}>
-    <App />
-  </MobileProvider>
-</ThemeProvider>
+<Provider theme="light" lang="ru" mobile={isMobile}>
+  <App />
+</Provider>
```

Вложенные локальные темы остаются на `ThemeProvider`:

```tsx
import {Provider, ThemeProvider} from '@gravity-ui/uikit';

<Provider theme="light" lang="ru">
  <App />
  <ThemeProvider theme="dark">
    <ChatPanel />
  </ThemeProvider>
</Provider>;
```

AIKit не добавляет корневой провайдер за приложение. `ChatContainer.isMobile` по-прежнему задаёт внутренний мобильный контекст. При включённом мобильном режиме UIKit 8 также использует мобильное представление Dialog и Modal. Проверьте диалог загрузки файлов внутри мобильного чата.

Импорт стилей в корне приложения сохраняется:

```tsx
import '@gravity-ui/uikit/styles/styles.css';
import '@gravity-ui/aikit/styles';
```

Точки входа `/themes/common`, `/themes/light`, `/themes/dark` и `/themes/variables` также доступны. Сохраните подходящий вашему приложению вариант подключения стилей.

Переводы AIKit теперь читают язык ближайшего UIKit-провайдера через `i18n.useTranslation()`. Меняйте `Provider.lang` для переключения языка или используйте `LangProvider` для отдельного поддерева. При наличии языкового провайдера глобальный вызов `configure({lang})` не нужен. См. [Internationalization](I18N.md).

## ContextItem и размеры контролов

Самый маленький размер Label переименован из `xxs` в `2xs`. `ContextItem.size` наследует `LabelProps['size']`, а экспортируемый AIKit тип `ControlSize` использует новое имя:

```diff
-<ContextItem content="Source" size="xxs" />
+<ContextItem content="Source" size="2xs" />
```

Аналогично замените `xxs` в аргументах `useMobileControlSize`, `resolveMobileControlSize` и `getControlIconSize`. Остальные размеры и значения по умолчанию для desktop/mobile сохраняются.

## История чатов

`History` и `HistoryList` используют стабильный UIKit 8 `List`. Поиск вынесен в отдельный `combobox`, связанный со списком через `useListFocusOwner`: стрелки и Enter работают из поля. Список имеет роль `grid`, строки — `row` с `gridcell`, поскольку содержат кнопки закрепления и удаления.

API AIKit для выбранного чата, группировки по датам, закрепления, удаления, кастомной фильтрации, ленивой загрузки и пустых состояний сохраняются.

Если тесты проверяют разметку, используйте именованный `grid` (`Chat history` в английской локали), его строки/ячейки или классы AIKit вместо `.g-list__*`. Классы `.g-aikit-history__*` остаются; представление строки UIKit теперь использует `.g-list-item-view`. Проверьте фон, отступы, выделение и фокус кнопок.

`ChatFilterFunction` и `defaultChatFilter` принимают `ListItemChatData` из AIKit напрямую. Обычные callback-функции менять не нужно; явные аннотации исправляются так:

```diff
-import type {ListItemData} from '@gravity-ui/uikit';
 import type {ListItemChatData} from '@gravity-ui/aikit';

-const matches = (item: ListItemData<ListItemChatData>) => /* ... */;
+const matches = (item: ListItemChatData) => /* ... */;
```

Данные по-прежнему различаются по `type`: `'chat'` или `'date-header'`. Перед чтением полей чата выполните соответствующую проверку.

Мобильная шторка внутри History переведена на UIKit `open`/`onOpenChange`. В приложении продолжайте передавать прежние `History.open` и `History.onOpenChange`.

## Меню Header и AttachmentPicker

Оба компонента используют стабильные `Menu`/`MenuItem`. Конфигурацию AIKit менять не требуется: `Header.menuItems`, подписи, иконки, QA-идентификаторы, обработчики, disabled и действия с вложениями сохраняются.

В мобильном Header меню выводится inline внутри шторки. На desktop пункты имеют кнопочную разметку с ролью `menuitem`. Перепишите селекторы, которые ожидают `.g-dropdown-menu__*`, старые `.g-menu__*` или `li > div[role="menuitem"]`. Предпочитайте свои `qa` или `getByRole('menuitem', {name: ...})`.

AIKit не импортирует `@gravity-ui/uikit/legacy`; его дополнительные drag-and-drop и virtualization peers для работы AIKit не нужны.

## Диалоги и команды ввода

У `FileUploadDialog` остаются `open`, `onClose`, `onApply` и `onCancel`. Внутри используется UIKit `onOpenChange`: при закрытии вызывается прежний `onClose`. Переименовывать callback в приложении не нужно. Проверьте уменьшенные отступы диалога и его мобильное представление.

Popup команд ввода переведён на `anchorElement`/`onOpenChange`. Конфигурация источников команд и императивный API PromptInput сохраняются. Проверьте ввод `/`/`@`, выбор контекста, поиск по кнопке, Escape и клик снаружи.

## Mermaid и SSR

Временный локальный выбор React-хука заменён на SSR-safe `useLayoutEffect` из UIKit. Настройка loader остаётся прежней:

```tsx
<MarkdownRenderer content={content} mermaidOptions={{load: () => import('mermaid')}} />
```

На сервере loader не вызывается. На клиенте закешированный SVG восстанавливается в layout effect до paint, в том числе при обновлении HTML стримящегося сообщения. Дополнительный провайдер или ранний импорт Mermaid не нужны.

## Темы, layout и виртуализация сообщений

Имена `--g-aikit-*` сохраняются. Изменения базовой палитры UIKit могут изменить наследуемые цвета. Кастомные темы UIKit нужно перегенерировать через `@gravity-ui/uikit-themer` v2; AIKit Themer уже использует v2. Проверьте обе темы и overrides удалённых токенов UIKit. Для собственных компонентов, layout, Select и CSS приложения используйте [руководство по UIKit 8](https://github.com/gravity-ui/uikit/blob/main/docs/migration-to-v8-ru.md).

В Loader и примерах `gap={2}` заменён на `gap="spacing-2"`, что сохраняет отступ 8px. Собственные числовые отступы UIKit Flex также нужно заменить на spacing-токены.

`MessageList` сохраняет виртуализацию через react-window v2. AIKit устанавливает её под npm-алиасом `react-window-v2`, чтобы не конфликтовать с необязательным legacy peer UIKit `react-window@1`. Пользователям AIKit не нужны новые импорты или зависимости: продолжайте использовать `virtualized`. Если само приложение устанавливает react-window v2 под исходным именем, его конфликт с peer UIKit нужно разрешить отдельно.

## Проверка после обновления

- Запустите проверку типов, lint, production build и интеграционные тесты с UIKit 8.0.0 — заявленным минимумом.
- Проверьте ширины 375px, около 1000px и 1400px в обеих темах. UIKit `l` теперь начинается с 980px; задайте в layout приложения 1080px явно, если нужен прежний порог.
- Откройте историю и меню клавиатурой и мышью. Найдите чат, выберите, закрепите/открепите и удалите. Кнопки строки не должны выбирать чат.
- Проверьте полную/ленивую загрузку, отсутствие результатов, пустую историю и мобильную шторку при открытой клавиатуре.
- Проверьте Apply/Cancel/Escape в загрузке файлов, выбор и закрытие команд ввода.
- Выполните SSR с включённым и выключенным Mermaid. При стриминге диаграмма из кеша не должна мигать исходным кодом.
- Просмотрите изменения скриншотов до обновления эталонов: смена палитры и меню ожидаема, переполнение и пропавший контент требуют исправления.

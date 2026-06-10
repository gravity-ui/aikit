# AIKit &middot; [![npm package](https://img.shields.io/npm/v/@gravity-ui/aikit?logo=npm)](https://www.npmjs.com/package/@gravity-ui/aikit) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/aikit/.github/workflows/ci.yml?branch=main&label=CI&logo=github)](https://github.com/gravity-ui/aikit/actions/workflows/ci.yml?query=branch:main) [![storybook](https://img.shields.io/badge/Storybook-deployed-ff4685?logo=storybook)](https://preview.gravity-ui.com/aikit/?path=/docs/pages-chatcontainer--docs)

Библиотека UI-компонентов для AI-чатов, построенная на принципах атомарного дизайна.

<!--GITHUB_BLOCK-->

![Cover image](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/aikit_cover.png)

![Example image](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/aikit_example.png)

## Ресурсы

### ![Globe Logo Light](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/globe_light.svg#gh-light-mode-only) ![Globe Logo Dark](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/globe_dark.svg#gh-dark-mode-only) [Сайт](https://gravity-ui.com/libraries/aikit)

### ![Storybook Logo Light](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/storybook_light.svg#gh-light-mode-only) ![Storybook Logo Dark](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/storybook_dark.svg#gh-dark-mode-only) [Storybook](https://preview.gravity-ui.com/aikit/)

### ![Community Logo Light](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/telegram_light.svg#gh-light-mode-only) ![Community Logo Dark](https://raw.githubusercontent.com/gravity-ui/aikit/main/docs/assets/telegram_dark.svg#gh-dark-mode-only) [Сообщество](https://t.me/gravity_ui)

<!--/GITHUB_BLOCK-->

## Описание

**@gravity-ui/aikit** — это гибкая и расширяемая библиотека React-компонентов для создания AI-чатов любой сложности. Библиотека предоставляет набор готовых компонентов, которые можно использовать как есть или кастомизировать под ваши нужды.

### Ключевые особенности

- 🎨 **Атомарный дизайн** — чёткая иерархия компонентов от атомов до страниц
- 🔧 **Независимость от SDK** — не привязана к конкретным AI SDK
- 🎭 **Двухуровневый подход** — готовые компоненты + хуки для кастомизации
- 🎨 **CSS-переменные** — простая кастомизация темы без переопределения компонентов
- 📦 **TypeScript** — полная типобезопасность из коробки
- 🔌 **Расширяемость** — система регистрации пользовательских типов сообщений

## Структура проекта

```
src/
├── components/
│   ├── atoms/          # Базовые неделимые UI-элементы
│   ├── molecules/      # Простые группы атомов
│   ├── organisms/      # Сложные компоненты с логикой
│   ├── templates/      # Готовые макеты
│   └── pages/          # Полные интеграции с данными
├── hooks/              # Хуки общего назначения
├── types/              # TypeScript-типы
├── utils/              # Утилиты
└── themes/             # CSS-темы и переменные
```

## Установка

```bash
npm install @gravity-ui/aikit
```

## Быстрый старт

```typescript
import { ChatContainer } from '@gravity-ui/aikit';
import type { ChatType, TChatMessage } from '@gravity-ui/aikit';

function App() {
    const [messages, setMessages] = useState<TChatMessage[]>([]);
    const [chats, setChats] = useState<ChatType[]>([]);
    const [activeChat, setActiveChat] = useState<ChatType | null>(null);

    return (
        <ChatContainer
            chats={chats}
            activeChat={activeChat}
            messages={messages}
            onSendMessage={async (data) => {
                // Ваша логика отправки
                console.log('Сообщение:', data.content);
            }}
            onSelectChat={setActiveChat}
            onCreateChat={() => {
                // Создание нового чата
            }}
            onDeleteChat={(chat) => {
                // Удаление чата
            }}
        />
    );
}
```

## Архитектура

Библиотека построена на принципах **атомарного дизайна**:

### 🔹 Атомы

Базовые неделимые UI-элементы без бизнес-логики:

- `ActionButton` — кнопка со встроенным тултипом
- `Alert` — сообщения с различными вариантами оформления
- `ChatDate` — форматирование даты с относительными датами
- `ContextIndicator` — индикатор использования контекста токенов
- `ContextItem` — метка контекста с возможностью удаления
- `DiffStat` — отображение статистики изменений кода
- `Disclaimer` — компонент текста-дисклеймера
- `InlineCitation` — текстовые цитаты
- `Loader` — индикатор загрузки
- `MarkdownRenderer` — рендерер Yandex Flavored Markdown
- `MessageBalloon` — обёртка сообщения
- `Shimmer` — эффект анимации загрузки
- `SubmitButton` — кнопка отправки с состояниями
- `ToolIndicator` — индикатор статуса выполнения инструмента

### 🔸 Молекулы

Простые комбинации атомов:

- `BaseMessage` — базовая обёртка для всех типов сообщений
- `ButtonGroup` — группа кнопок с поддержкой ориентации
- `InputContext` — управление контекстом
- `PromptInputBody` — текстовое поле с авторастягиванием
- `PromptInputFooter` — футер с иконками действий и кнопкой отправки
- `PromptInputHeader` — хедер с элементами контекста и индикатором
- `PromptInputPanel` — панель-контейнер для пользовательского контента
- `Suggestions` — кликабельные кнопки предложений
- `Tabs` — навигационные вкладки с функцией удаления
- `ToolFooter` — футер сообщения инструмента с действиями
- `ToolHeader` — хедер сообщения инструмента с иконкой и действиями

### 🔶 Организмы

Сложные компоненты с внутренней логикой:

- `AssistantMessage` — сообщение AI-ассистента
- `Header` — хедер чата
- `MessageList` — список сообщений
- `PromptInput` — поле ввода сообщения
- `ThinkingMessage` — процесс размышления AI
- `ToolMessage` — выполнение инструмента
- `UserMessage` — сообщение пользователя

### 📄 Шаблоны

Готовые макеты:

- `ChatContent` — основной контент чата
- `EmptyContainer` — пустое состояние
- `History` — история чатов

### 📱 Страницы

Полные интеграции:

- `ChatContainer` — полностью собранный чат

## Документация

- [Руководство по быстрому старту](./docs/GETTING_STARTED.md)
- [Архитектура](./docs/ARCHITECTURE.md)
- [Структура проекта](./docs/PROJECT_STRUCTURE.md)
- [Руководство по тестированию](./docs/TESTING.md)
- [Руководство по Playwright](./playwright/README.md)

## Тестирование

Проект использует Playwright Component Testing для визуального регрессионного тестирования.

### Запуск тестов

**Важно**: Все тесты должны запускаться через Docker для обеспечения консистентности скриншотов в различных окружениях.

```bash
# Запуск всех компонентных тестов в Docker (рекомендуется)
npm run playwright:docker

# Обновление эталонных скриншотов в Docker
npm run playwright:docker:update

# Запуск конкретного теста по grep-паттерну в Docker
npm run playwright:docker -- --grep "@ComponentName"

# Очистка кэша Docker при необходимости
npm run playwright:docker:clear-cache
```

### Локальное тестирование (только Linux)

Если вы работаете на Linux, вы можете запускать тесты локально:

```bash
# Установка браузеров Playwright (выполняется один раз)
npm run playwright:install

# Запуск всех компонентных тестов
npm run playwright

# Обновление эталонных скриншотов
npm run playwright:update
```

Подробная документация по тестированию доступна в [Руководстве по Playwright](./playwright/README.md).

## Разработка

Инструкции по разработке и контрибьютингу доступны в [CONTRIBUTING.md](./CONTRIBUTING.md).

## Лицензия

MIT

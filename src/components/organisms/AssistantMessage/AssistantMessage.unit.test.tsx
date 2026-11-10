import '@testing-library/jest-dom';
import {render, screen} from '@testing-library/react';

import {AssistantMessage} from './AssistantMessage';

jest.mock('./defaultMessageTypeRegistry', () => ({
    createDefaultMessageRegistry: () => ({
        text: {component: ({part}: {part: {data: {text: string}}}) => <p>{part.data.text}</p>},
    }),
}));
jest.mock('../ThinkingMessageGroup', () => ({ThinkingMessageGroup: () => null}));

it('renders the opt-in footer after text and before actions/time', () => {
    const {container} = render(
        <AssistantMessage
            content="Answer"
            footerContent={<div data-testid="card">Card</div>}
            actions={[{label: 'Copy answer', onClick: () => {}}]}
            timestamp="2026-11-03T10:00:00Z"
            showTimestamp
        />,
    );
    const text = screen.getByText('Answer');
    const card = screen.getByTestId('card');
    const actions = container.querySelector('.g-aikit-base-message__actions');
    if (!actions) {
        throw new Error('Expected actions');
    }
    expect(text.compareDocumentPosition(card)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(card.compareDocumentPosition(actions)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});
it('keeps the default content without adding a footer', () => {
    render(<AssistantMessage content="Default answer" />);
    expect(screen.getByText('Default answer')).toBeVisible();
    expect(screen.queryByTestId('card')).toBeNull();
});

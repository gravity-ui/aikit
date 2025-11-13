import React from 'react';

import '@testing-library/jest-dom';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {Tabs} from '../Tabs';

describe('Tabs', () => {
    const mockItems = [
        {id: 'tab1', title: 'First Tab'},
        {id: 'tab2', title: 'Second Tab'},
        {id: 'tab3', title: 'Third Tab'},
    ];

    describe('tab selection', () => {
        it('should call onSelectItem with correct id when tab is clicked', async () => {
            const user = userEvent.setup();
            const onSelectItem = jest.fn();

            render(<Tabs items={mockItems} onSelectItem={onSelectItem} qa="tabs" />);

            await user.click(screen.getByText('Second Tab'));

            expect(onSelectItem).toHaveBeenCalledTimes(1);
            expect(onSelectItem).toHaveBeenCalledWith('tab2');
        });

        it('should call onSelectItem for each tab click', async () => {
            const user = userEvent.setup();
            const onSelectItem = jest.fn();

            render(<Tabs items={mockItems} onSelectItem={onSelectItem} qa="tabs" />);

            await user.click(screen.getByText(mockItems[0].title));
            await user.click(screen.getByText(mockItems[2].title));

            expect(onSelectItem).toHaveBeenCalledTimes(2);
            expect(onSelectItem).toHaveBeenNthCalledWith(1, mockItems[0].id);
            expect(onSelectItem).toHaveBeenNthCalledWith(2, mockItems[2].id);
        });

        it('should not crash when clicking tab without onSelectItem callback', async () => {
            const user = userEvent.setup();

            render(<Tabs items={mockItems} qa="tabs" />);

            await expect(user.click(screen.getByText(mockItems[0].title))).resolves.not.toThrow();
        });

        it('should allow clicking the same tab multiple times', async () => {
            const user = userEvent.setup();
            const onSelectItem = jest.fn();

            render(<Tabs items={mockItems} onSelectItem={onSelectItem} qa="tabs" />);

            await user.click(screen.getByText(mockItems[0].title));
            await user.click(screen.getByText(mockItems[0].title));

            expect(onSelectItem).toHaveBeenCalledTimes(2);
            expect(onSelectItem).toHaveBeenNthCalledWith(1, mockItems[0].id);
            expect(onSelectItem).toHaveBeenNthCalledWith(2, mockItems[0].id);
        });
    });

    describe('active state', () => {
        it('should mark tab as active when activeId matches', () => {
            const {container} = render(
                <Tabs items={mockItems} activeId={mockItems[1].id} qa="tabs" />,
            );

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');
            expect(tabs[1]).toHaveClass('g-label_theme_info');
            expect(tabs[1]).toHaveClass('g-aikit-tabs__tab_active');
        });

        it('should mark only one tab as active', () => {
            const {container} = render(
                <Tabs items={mockItems} activeId={mockItems[0].id} qa="tabs" />,
            );

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');
            expect(tabs[0]).toHaveClass('g-label_theme_info');
            expect(tabs[0]).toHaveClass('g-aikit-tabs__tab_active');
            expect(tabs[1]).toHaveClass('g-label_theme_clear');
            expect(tabs[1]).not.toHaveClass('g-aikit-tabs__tab_active');
            expect(tabs[2]).toHaveClass('g-label_theme_clear');
            expect(tabs[2]).not.toHaveClass('g-aikit-tabs__tab_active');
        });

        it('should have no active tab when activeId does not match any item', () => {
            const {container} = render(<Tabs items={mockItems} activeId="nonexistent" qa="tabs" />);

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');
            expect(tabs[0]).toHaveClass('g-label_theme_clear');
            expect(tabs[1]).toHaveClass('g-label_theme_clear');
            expect(tabs[2]).toHaveClass('g-label_theme_clear');
        });

        it('should have no active tab when activeId is not provided', () => {
            const {container} = render(<Tabs items={mockItems} qa="tabs" />);

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');
            expect(tabs[0]).toHaveClass('g-label_theme_clear');
            expect(tabs[1]).toHaveClass('g-label_theme_clear');
        });
    });

    describe('tab deletion', () => {
        it('should call onDeleteItem with correct id when close icon is clicked', async () => {
            const user = userEvent.setup();
            const onDeleteItem = jest.fn().mockResolvedValue(undefined);

            const {container} = render(
                <Tabs items={mockItems} allowDelete onDeleteItem={onDeleteItem} qa="tabs" />,
            );

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');
            const secondTab = tabs[1] as HTMLElement;

            const buttons = within(secondTab).getAllByRole('button');
            const closeButton = buttons.find(
                (btn) => !btn.classList.contains('g-label__main-button'),
            );

            if (closeButton) {
                await user.click(closeButton);
            }

            expect(onDeleteItem).toHaveBeenCalledTimes(1);
            expect(onDeleteItem).toHaveBeenCalledWith(mockItems[1].id);
        });

        it('should call onDeleteItem for each close button click', async () => {
            const user = userEvent.setup();
            const onDeleteItem = jest.fn().mockResolvedValue(undefined);

            const {container} = render(
                <Tabs items={mockItems} allowDelete onDeleteItem={onDeleteItem} qa="tabs" />,
            );

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');

            const firstTabButtons = within(tabs[0] as HTMLElement).getAllByRole('button');
            const firstCloseButton = firstTabButtons.find(
                (btn) => !btn.classList.contains('g-label__main-button'),
            );
            if (firstCloseButton) {
                await user.click(firstCloseButton);
            }

            const thirdTabButtons = within(tabs[2] as HTMLElement).getAllByRole('button');
            const thirdCloseButton = thirdTabButtons.find(
                (btn) => !btn.classList.contains('g-label__main-button'),
            );
            if (thirdCloseButton) {
                await user.click(thirdCloseButton);
            }

            expect(onDeleteItem).toHaveBeenCalledTimes(2);
            expect(onDeleteItem).toHaveBeenNthCalledWith(1, mockItems[0].id);
            expect(onDeleteItem).toHaveBeenNthCalledWith(2, mockItems[2].id);
        });

        it('should not crash when clicking close button without onDeleteItem callback', async () => {
            const user = userEvent.setup();

            const {container} = render(<Tabs items={mockItems} allowDelete qa="tabs" />);

            const tabs = container.querySelectorAll('.g-aikit-tabs__tab');
            const buttons = within(tabs[0] as HTMLElement).getAllByRole('button');
            const closeButton = buttons.find(
                (btn) => !btn.classList.contains('g-label__main-button'),
            );

            if (closeButton) {
                await expect(user.click(closeButton)).resolves.not.toThrow();
            }
        });
    });
});

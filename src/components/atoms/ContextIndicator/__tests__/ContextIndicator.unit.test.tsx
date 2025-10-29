// @ts-ignore - React import needed for JSX
import React from 'react';
import {render} from '@testing-library/react';
import {ContextIndicator} from '../index';

describe('ContextIndicator', () => {
    describe('percent type', () => {
        test('should render with correct percentage', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={50} />);
            expect(container.textContent).toContain('50');
        });

        test('should render 0%', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={0} />);
            expect(container.textContent).toContain('0');
        });

        test('should render 100%', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={100} />);
            expect(container.textContent).toContain('100');
        });

        test('should clamp values above 100', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={150} />);
            expect(container.textContent).toContain('100');
        });
    });

    describe('number type', () => {
        test('should calculate percentage correctly', () => {
            const {container} = render(
                <ContextIndicator type="number" usedContext={50} maxContext={100} />,
            );
            expect(container.textContent).toContain('50');
        });

        test('should calculate 0%', () => {
            const {container} = render(
                <ContextIndicator type="number" usedContext={0} maxContext={100} />,
            );
            expect(container.textContent).toContain('0');
        });

        test('should calculate 100%', () => {
            const {container} = render(
                <ContextIndicator type="number" usedContext={100} maxContext={100} />,
            );
            expect(container.textContent).toContain('100');
        });

        test('should round percentage to nearest integer', () => {
            const {container} = render(
                <ContextIndicator type="number" usedContext={33} maxContext={100} />,
            );
            expect(container.textContent).toContain('33');
        });

        test('should handle large numbers', () => {
            const {container} = render(
                <ContextIndicator type="number" usedContext={750000} maxContext={1000000} />,
            );
            expect(container.textContent).toContain('75');
        });

        test('should handle decimal results', () => {
            const {container} = render(
                <ContextIndicator type="number" usedContext={1} maxContext={3} />,
            );
            expect(container.textContent).toContain('33');
        });
    });

    describe('className and qa props', () => {
        test('should apply custom className', () => {
            const {container} = render(
                <ContextIndicator type="percent" usedContext={50} className="custom-class" />,
            );
            expect(container.querySelector('.custom-class')).toBeTruthy();
        });

        test('should apply qa attribute', () => {
            const {container} = render(
                <ContextIndicator type="percent" usedContext={50} qa="test-qa" />,
            );
            expect(container.querySelector('[data-qa="test-qa"]')).toBeTruthy();
        });
    });

    describe('orientation', () => {
        test('should default to horizontal orientation', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={50} />);
            expect(
                container.querySelector(
                    '.ai-chat-context-indicator__container_orientation_horizontal',
                ),
            ).toBeTruthy();
        });

        test('should apply vertical orientation', () => {
            const {container} = render(
                <ContextIndicator type="percent" usedContext={50} orientation="vertical" />,
            );
            expect(
                container.querySelector(
                    '.ai-chat-context-indicator__container_orientation_vertical',
                ),
            ).toBeTruthy();
        });
    });

    describe('CSS custom property', () => {
        test('should set --percentage CSS variable correctly', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={75} />);
            const progressElement = container.querySelector(
                '.ai-chat-context-indicator__progress',
            ) as HTMLElement;
            expect(progressElement?.getAttribute('style')).toContain('--percentage: 75');
        });

        test('should clamp CSS variable to 100', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={150} />);
            const progressElement = container.querySelector(
                '.ai-chat-context-indicator__progress',
            ) as HTMLElement;
            expect(progressElement?.getAttribute('style')).toContain('--percentage: 100');
        });

        test('should clamp CSS variable to 0', () => {
            const {container} = render(<ContextIndicator type="percent" usedContext={-10} />);
            const progressElement = container.querySelector(
                '.ai-chat-context-indicator__progress',
            ) as HTMLElement;
            expect(progressElement?.getAttribute('style')).toContain('--percentage: 0');
        });
    });
});

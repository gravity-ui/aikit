import React from 'react';

import {isActionConfig, isReactNodeAction} from '../actionUtils';

describe('actionUtils', () => {
    describe('isActionConfig', () => {
        it('should return true for ActionConfig object', () => {
            const action = {
                label: 'Test',
                onClick: () => {},
                view: 'normal' as const,
            };

            expect(isActionConfig(action)).toBe(true);
        });

        it('should return true for ActionConfig with icon', () => {
            const action = {
                label: 'Test',
                icon: React.createElement('span', {}, 'icon'),
                onClick: () => {},
            };

            expect(isActionConfig(action)).toBe(true);
        });

        it('should return false for React element', () => {
            const action = React.createElement('button', {}, 'Click me');

            expect(isActionConfig(action)).toBe(false);
        });

        it('should return false for React component', () => {
            const CustomButton = () => React.createElement('button', {}, 'Custom');
            const action = React.createElement(CustomButton);

            expect(isActionConfig(action)).toBe(false);
        });

        it('should return true for empty object', () => {
            const action = {};

            expect(isActionConfig(action)).toBe(true);
        });

        it('should return true for partial ActionConfig', () => {
            const action = {
                onClick: () => {},
            };

            expect(isActionConfig(action)).toBe(true);
        });
    });

    describe('isReactNodeAction', () => {
        it('should return false for ActionConfig object', () => {
            const action = {
                label: 'Test',
                onClick: () => {},
                view: 'normal' as const,
            };

            expect(isReactNodeAction(action)).toBe(false);
        });

        it('should return true for React element', () => {
            const action = React.createElement('button', {}, 'Click me');

            expect(isReactNodeAction(action)).toBe(true);
        });

        it('should return true for React component', () => {
            const CustomButton = () => React.createElement('button', {}, 'Custom');
            const action = React.createElement(CustomButton);

            expect(isReactNodeAction(action)).toBe(true);
        });

        it('should return true for JSX element', () => {
            const action = React.createElement('div', {className: 'test'}, 'Content');

            expect(isReactNodeAction(action)).toBe(true);
        });

        it('should return false for empty object', () => {
            const action = {};

            expect(isReactNodeAction(action)).toBe(false);
        });

        it('should return false for partial ActionConfig', () => {
            const action = {
                onClick: () => {},
            };

            expect(isReactNodeAction(action)).toBe(false);
        });
    });

    describe('type guards work correctly together', () => {
        it('isActionConfig and isReactNodeAction should be mutually exclusive', () => {
            const actionConfig = {label: 'Test', onClick: () => {}};
            const reactElement = React.createElement('button', {}, 'Click');

            expect(isActionConfig(actionConfig)).toBe(true);
            expect(isReactNodeAction(actionConfig)).toBe(false);

            expect(isActionConfig(reactElement)).toBe(false);
            expect(isReactNodeAction(reactElement)).toBe(true);
        });
    });
});

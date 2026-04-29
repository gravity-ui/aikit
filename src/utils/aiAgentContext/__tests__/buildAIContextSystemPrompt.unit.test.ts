// src/utils/aiAgentContext/__tests__/buildAIContextSystemPrompt.unit.test.ts

import {
    AI_CONTEXT_SYSTEM_PROMPT_HEADER,
    buildAIContextSystemPrompt,
} from '../buildAIContextSystemPrompt';

describe('buildAIContextSystemPrompt', () => {
    it('should return empty string for empty entries', () => {
        expect(buildAIContextSystemPrompt([])).toBe('');
    });

    it('should format single entry with default YAML formatter', () => {
        const result = buildAIContextSystemPrompt([
            {it: 'Current user', data: {name: 'Alice', email: 'alice@example.com'}},
        ]);

        expect(result).toBe(
            AI_CONTEXT_SYSTEM_PROMPT_HEADER +
                '### Current user\n' +
                'name: Alice\n' +
                'email: alice@example.com',
        );
    });

    it('should format multiple entries', () => {
        const result = buildAIContextSystemPrompt([
            {it: 'Current user', data: {name: 'Alice'}},
            {it: 'Current page', data: {title: 'Dashboard'}},
        ]);

        expect(result).toContain('### Current user');
        expect(result).toContain('### Current page');
        expect(result).toContain('name: Alice');
        expect(result).toContain('title: Dashboard');
    });

    it('should use custom formatData when provided', () => {
        const customFormatter = (data: unknown) => JSON.stringify(data);

        const result = buildAIContextSystemPrompt([{it: 'User', data: {name: 'Alice'}}], {
            formatData: customFormatter,
        });

        expect(result).toContain('### User');
        expect(result).toContain('{"name":"Alice"}');
    });

    it('should handle primitive data', () => {
        const result = buildAIContextSystemPrompt([{it: 'User count', data: 42}]);

        expect(result).toContain('### User count');
        expect(result).toContain('42');
    });
});

import {buildAIContextSystemPrompt} from '../buildAIContextSystemPrompt';
import {AIPrompt} from '../templateStrings';

const DEFAULT_HEADER =
    'Meta information provided by the user about the current page they are on:\n\n';

describe('buildAIContextSystemPrompt', () => {
    it('should return empty string for empty entries', () => {
        expect(buildAIContextSystemPrompt([])).toBe('');
    });

    it('should format single entry with default YAML formatter', () => {
        const result = buildAIContextSystemPrompt([
            {it: 'Current user', data: {name: 'Alice', email: 'alice@example.com'}},
        ]);

        expect(result).toBe(
            DEFAULT_HEADER +
                '### Current user\n\n' +
                'name: Alice\n' +
                'email: alice@example.com\n',
        );
    });

    it('should format multiple entries separated by blank lines', () => {
        const result = buildAIContextSystemPrompt([
            {it: 'Current user', data: {name: 'Alice'}},
            {it: 'Current page', data: {title: 'Dashboard'}},
        ]);

        expect(result).toBe(
            DEFAULT_HEADER +
                '### Current user\n\n' +
                'name: Alice\n\n' +
                '### Current page\n\n' +
                'title: Dashboard\n',
        );
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

    it('should use custom template from AIPrompt', () => {
        const template = AIPrompt`Page context:

${(entries, options) => entries.map((entry) => `## ${entry.it}\n${options.formatData(entry.data)}`)}
`;

        const result = buildAIContextSystemPrompt([{it: 'Current user', data: {name: 'Bob'}}], {
            template,
        });

        expect(result).toBe('Page context:\n\n## Current user\nname: Bob\n');
    });
});

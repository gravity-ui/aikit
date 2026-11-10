/** @jest-environment node */
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import {renderToString} from 'react-dom/server';

import {AgentComposer} from '../../components/pages/AgentChat/AgentComposer';

it('renders the experimental composer without a DOM using the provider locale', () => {
    configure({lang: 'en'});
    try {
        const html = renderToString(
            <ThemeProvider lang="ru">
                <AgentComposer
                    models={[{id: 'default', name: 'Default model'}]}
                    model="default"
                    onModelChange={() => {}}
                    repositories={[]}
                    repository={{orgSlug: '', repoSlug: ''}}
                    onRepositoryChange={() => {}}
                    skills={[]}
                    status="ready"
                    onSend={async () => {}}
                    onStop={() => {}}
                />
            </ThemeProvider>,
        );
        expect(html).toContain('Планируйте');
        expect(html).toContain('Репозиторий');
    } finally {
        configure({lang: 'en'});
    }
});

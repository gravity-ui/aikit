import {type ComponentProps, useState} from 'react';

import {AgentComposer as Composer} from '../../AgentComposer';
import type {ModelItem} from '../../controls/shared/types/models';
const skills: Array<{slug: string; title?: string}> = [
    {slug: 'implement-feature', title: 'Build a feature with repository context'},
    {slug: 'review', title: 'Review code changes'},
    {slug: 'write-tests', title: 'Add regression tests'},
];
const models: ModelItem[] = [
    {
        id: 'default',
        created: 1,
        name: 'Default model',
        description: 'Default model',
        context_length: 128000,
        max_output_tokens: 8192,
        architecture: {input_modalities: ['text'], output_modalities: ['text']},
        supported_parameters: [],
        external: false,
    },
];

export function AgentComposer(
    props: Pick<ComponentProps<typeof Composer>, 'status' | 'onSend' | 'onStop'>,
) {
    const [repository, setRepository] = useState({orgSlug: 'demo', repoSlug: 'storefront'});
    const [model, setModel] = useState('default');
    return (
        <Composer
            {...props}
            models={models}
            modelLabel="Default"
            skills={skills}
            repositories={[
                {orgSlug: 'demo', slug: 'storefront'},
                {orgSlug: 'demo', slug: 'design-system'},
                {orgSlug: 'demo', slug: 'api-service'},
            ]}
            repository={repository}
            onRepositoryChange={setRepository}
            model={model}
            onModelChange={setModel}
        />
    );
}

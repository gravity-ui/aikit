import {type ComponentProps, useState} from 'react';

import {Sparkles} from '@gravity-ui/icons';

import {AgentComposer as Composer} from '../../AgentComposer';
import type {AgentModelOption} from '../../types';
const skills: Array<{slug: string; title?: string}> = [
    {slug: 'implement-feature', title: 'Build a feature with repository context'},
    {slug: 'review', title: 'Review code changes'},
    {slug: 'write-tests', title: 'Add regression tests'},
];
const models: AgentModelOption[] = [
    {
        id: 'default',
        name: 'Default model',
        description: 'Default model',
    },
];

export function AgentComposer({
    compactControls,
    ...props
}: Pick<ComponentProps<typeof Composer>, 'status' | 'onSend' | 'onStop'> & {
    compactControls?: boolean;
}) {
    const [repository, setRepository] = useState({orgSlug: 'demo', repoSlug: 'storefront'});
    const [model, setModel] = useState('default');
    return (
        <Composer
            {...props}
            models={models}
            modelLabel="Default"
            modelCompactIcon={compactControls ? Sparkles : undefined}
            hideModelChevron={compactControls}
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

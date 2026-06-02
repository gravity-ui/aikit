import { Magnifier } from '@gravity-ui/icons';

import type { TExactToolset } from '@/types/agent';
import { ToolName, type ToolsetName } from 'shared/agent/types';

import { executeFinishSkill } from './agentTools/FinishSkill';
import { executeStartSkill } from './agentTools/StartSkill';
import { ToolStartSkill } from './components/ToolStartSkill';
import { i18n } from './i18n';

export const backendToolset: TExactToolset<ToolsetName.Backend> = {
[ToolName.DocumentationSearch]: {
execute: async () => ({ content: '', status: 'success' as const, payload: {} }),
serverSide: true,
displayName: [
i18n('tool_documentation_search'),
i18n('tool_documentation_search_complete'),
],
icon: Magnifier,
},
};

export const skillsToolset: TExactToolset<ToolsetName.Skills> = {
[ToolName.StartSkill]: {
execute: executeStartSkill,
displayName: [i18n('tool_start_skill'), i18n('tool_start_skill_complete')],
component: ToolStartSkill,
},
[ToolName.FinishSkill]: {
execute: executeFinishSkill,
displayName: [i18n('tool_finish_skill'), i18n('tool_finish_skill_complete')],
},
};

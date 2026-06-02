import React from 'react';

import { useModel } from '@yandex-data-ui/statekit';

import { type ToolName } from 'shared/agent/types';

import { AgentToolsetsModel } from '../../deps';
import { useAgentChatContext } from '../AgentChatContext';
import { GenericToolUseBlock } from '../GenericToolUseBlock';

export interface ToolUseBlockProps {
toolName: string;
}

export function ToolUseBlock({ toolName }: ToolUseBlockProps) {
const { agentType } = useAgentChatContext();
const agentToolset = useModel(AgentToolsetsModel.token({ agentType }));
const toolDef = agentToolset.tools[toolName as ToolName];

    if (toolDef?.component) {
        return <toolDef.component />;
    }

    return <GenericToolUseBlock />;

}

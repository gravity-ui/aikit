import {useState} from 'react';

import {HeaderAction, type HeaderProps} from '../../../../organisms/Header';
export function useAgentChrome() {
    const [closed, setClosed] = useState(false);
    const headerProps: Partial<HeaderProps> = {
        title: 'Code Assistant',
        withIcon: false,
        baseActions: [HeaderAction.NewChat, HeaderAction.History, HeaderAction.Close],
    };
    return {closed, setClosed, headerProps};
}

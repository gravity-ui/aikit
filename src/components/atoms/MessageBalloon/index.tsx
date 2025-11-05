import {block} from '../../../utils/cn';

import './MessageBalloon.scss';

const b = block('message-balloon');

export type MessageBalloonProps = {
    children: React.ReactNode;
    className?: string;
    qa?: string;
};

export const MessageBalloon = (props: MessageBalloonProps) => {
    const {className, qa, children} = props;

    return (
        <div className={b(null, className)} data-qa={qa}>
            {children}
        </div>
    );
};

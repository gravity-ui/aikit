import {DOMProps, QAProps} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import './DiffStat.scss';

const b = block('diff-stat');

type DiffStatProps = DOMProps &
    QAProps & {
        added: number;
        deleted: number;
    };

export const DiffStat = (props: DiffStatProps) => {
    const {added, deleted, className, style, qa} = props;

    return (
        <div className={b(null, className)} style={style} data-qa={qa}>
            <div className={b('added', {allow_sign: Boolean(added)})}>{added}</div>
            <div className={b('deleted', {allow_sign: Boolean(deleted)})}>{deleted}</div>
        </div>
    );
};

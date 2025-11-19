import {ArrowRotateLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import {Alert, AlertProps} from '../../atoms/Alert';

import {i18n} from './i18n';

const b = block('message-list');

export type ErrorAlertProps = {
    onRetry?: () => void;
    errorMessage?: AlertProps;
    className?: string;
};

export function ErrorAlert({onRetry, errorMessage, className}: ErrorAlertProps) {
    return (
        <Alert
            text={i18n('default-error-text')}
            variant="warning"
            button={
                onRetry
                    ? {
                          content: (
                              <div className={b('retry-button')}>
                                  <Icon data={ArrowRotateLeft} size={14} />
                                  {i18n('retry-button')}
                              </div>
                          ),
                          onClick: onRetry,
                      }
                    : undefined
            }
            className={className}
            {...errorMessage}
        />
    );
}

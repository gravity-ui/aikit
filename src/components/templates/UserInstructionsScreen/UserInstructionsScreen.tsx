import {useEffect, useLayoutEffect, useRef, useState} from 'react';

import {Button, Text, TextArea, useUniqId} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';

import {i18n} from './i18n';
import type {UserInstructionsScreenProps, UserInstructionsScreenState} from './types';

import './UserInstructionsScreen.scss';

const b = block('user-instructions-screen');

export function UserInstructionsScreen({
    value,
    maxLength,
    onSave,
    onSaved,
    onCancel,
    onStateChange,
    disabled = false,
    texts = {},
    className,
    qa = 'user-instructions-screen',
}: UserInstructionsScreenProps) {
    const {t} = i18n.useTranslation();
    const id = useUniqId();
    const [form, setForm] = useState({draft: value, baseline: value});
    const [saving, setSaving] = useState(false);
    const [saveFailed, setSaveFailed] = useState(false);
    const revision = useRef(0);
    const busy = useRef(false);
    const mounted = useRef(false);
    const reported = useRef<UserInstructionsScreenState>();
    const dirty = form.draft !== form.baseline;
    const invalid = form.draft.length > maxLength;

    if (!Number.isInteger(maxLength) || maxLength < 0) {
        throw new Error('UserInstructionsScreen: maxLength must be a non-negative integer.');
    }

    useLayoutEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            revision.current += 1;
        };
    }, []);

    useEffect(() => {
        setForm((previous) => {
            if (previous.draft === previous.baseline && previous.baseline !== value) {
                return {draft: value, baseline: value};
            }
            return previous;
        });
    }, [value]);

    useLayoutEffect(() => {
        if (reported.current?.dirty !== dirty || reported.current?.saving !== saving) {
            reported.current = {dirty, saving};
            onStateChange?.({dirty, saving});
        }
    }, [dirty, saving, onStateChange]);

    const save = async () => {
        if (busy.current || disabled || invalid) {
            return;
        }
        const token = ++revision.current;
        const submitted = form.draft;
        busy.current = true;
        setSaving(true);
        setSaveFailed(false);
        try {
            await onSave(submitted);
        } catch {
            if (mounted.current && token === revision.current) {
                busy.current = false;
                setSaving(false);
                setSaveFailed(true);
            }
            return;
        }
        if (mounted.current && token === revision.current) {
            busy.current = false;
            setSaving(false);
            setForm({draft: submitted, baseline: submitted});
            onSaved?.();
        }
    };

    return (
        <form
            className={b(null, className)}
            data-qa={qa}
            aria-busy={saving}
            onSubmit={(event) => {
                event.preventDefault();
                save();
            }}
        >
            <Text color="complementary">{texts.description ?? t('description')}</Text>
            <div className={b('field')}>
                <label htmlFor={id}>{texts.label ?? t('label')}</label>
                <TextArea
                    id={id}
                    value={form.draft}
                    onUpdate={(draft) => {
                        setForm((previous) => ({...previous, draft}));
                        setSaveFailed(false);
                    }}
                    placeholder={texts.placeholder ?? t('placeholder')}
                    minRows={6}
                    size="l"
                    disabled={disabled || saving}
                    controlProps={{maxLength, 'aria-describedby': `${id}-counter`}}
                    validationState={invalid ? 'invalid' : undefined}
                    errorMessage={invalid ? (texts.limitError ?? t('limit-error')) : undefined}
                />
                <Text id={`${id}-counter`} color="secondary" className={b('counter')}>
                    {form.draft.length} / {maxLength}
                </Text>
            </div>
            {saveFailed && <div role="alert">{texts.saveError ?? t('save-error')}</div>}
            <div className={b('actions')}>
                <Button
                    type="submit"
                    view="action"
                    size="l"
                    loading={saving}
                    disabled={disabled || invalid || saving}
                >
                    {texts.save ?? t('save')}
                </Button>
                <Button
                    view="outlined"
                    size="l"
                    disabled={disabled || saving}
                    onClick={() => {
                        setForm({draft: value, baseline: value});
                        setSaveFailed(false);
                        onCancel();
                    }}
                >
                    {texts.cancel ?? t('cancel')}
                </Button>
            </div>
        </form>
    );
}

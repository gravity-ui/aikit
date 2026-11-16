export interface UserInstructionsScreenState {
    dirty: boolean;
    saving: boolean;
}

export interface UserInstructionsScreenTexts {
    description?: string;
    label?: string;
    placeholder?: string;
    save?: string;
    cancel?: string;
    saveError?: string;
    limitError?: string;
}

export interface UserInstructionsScreenProps {
    /** Saved value. A changed value refreshes a clean form, never a dirty draft. */
    value: string;
    /** Untrimmed UTF-16 string length, shared by the counter, input limit, and validation. */
    maxLength: number;
    /** Persist the submitted value. Reject to retain the draft and display an error. */
    onSave: (value: string) => Promise<void>;
    /** Called after successful persistence only while this screen visit is still mounted. */
    onSaved?: () => void;
    /** Discard the local draft and return to the owning view. */
    onCancel: () => void;
    /** Use with the screen definition's beforeLeave to block exit while saving or confirm discard. */
    onStateChange?: (state: UserInstructionsScreenState) => void;
    disabled?: boolean;
    texts?: UserInstructionsScreenTexts;
    className?: string;
    qa?: string;
}

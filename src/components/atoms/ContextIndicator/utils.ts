export const getProgressColor = (percentage: number) => {
    if (percentage < 34) {
        return 'var(--g-aikit-ci-color-progress-1)';
    }

    if (percentage < 66) {
        return 'var(--g-aikit-ci-color-progress-2)';
    }

    return 'var(--g-aikit-ci-color-progress-3)';
};

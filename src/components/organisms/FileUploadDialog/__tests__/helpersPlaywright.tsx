import {composeStories} from '@storybook/react';

import * as StoriesModule from '../__stories__/FileUploadDialog.stories';

const composed = composeStories(StoriesModule);

/**
 * Portable stories for CT. `Default` matches `Playground` in CSF (same `Controlled` shell);
 * some Storybook versions compose `Default` incorrectly, so we pin it to `Playground`.
 */
export const FileUploadDialogStories = {
    ...composed,
    Default: composed.Playground,
};

import '@gravity-ui/uikit/styles/styles.scss';
import {ThemeProvider} from '@gravity-ui/uikit';

const preview = {
    decorators: [
        (Story) => (
            <ThemeProvider theme="light">
                <Story />
            </ThemeProvider>
        ),
    ],
};

export default preview;

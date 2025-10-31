import {resolve} from 'path';

import {defineConfig, devices} from '@playwright/experimental-ct-react';

/**
 * Playwright Component Testing configuration
 * See https://playwright.dev/docs/test-components
 */
export default defineConfig({
    outputDir: resolve(__dirname, 'playwright/test-results'),
    testDir: './src',
    testMatch: '**/__tests__/*.visual.spec.tsx',
    updateSnapshots: process.env.UPDATE_REQUEST ? 'all' : 'missing',
    snapshotPathTemplate: '{testDir}/{testFileDir}/__snapshots__/{arg}{-projectName}{ext}',

    // Maximum time one test can run for
    timeout: 10 * 1000,

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: Boolean(process.env.CI),

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: 'html',

    // Screenshot comparison settings
    expect: {
        toHaveScreenshot: {
            // Позволяет небольшие различия в рендеринге между платформами
            maxDiffPixelRatio: 0.02, // Разрешить до 2% различий
        },
    },

    use: {
        // Base URL to use in actions like `await page.goto('/')`
        trace: 'on-first-retry',

        // Port for the dev server
        ctPort: 3100,

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Vite configuration
        ctViteConfig: {
            plugins: [
                {
                    name: 'stub-mdx-files',
                    resolveId(id) {
                        if (id.endsWith('.mdx')) {
                            return id;
                        }
                        return null;
                    },
                    load(id) {
                        if (id.endsWith('.mdx')) {
                            return 'export default () => null;';
                        }
                        return null;
                    },
                },
            ],
        },
    },

    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
    ],
});

import {defineConfig} from '@playwright/test';

export default defineConfig({
    testDir: './browser',
    testMatch: 'chat-screens.spec.ts',
    timeout: 30000,
    workers: 1,
    reporter: 'list',
    use: {baseURL: 'http://127.0.0.1:6011', trace: 'retain-on-failure'},
    outputDir: '../playwright/test-results/screens',
    webServer: {
        command: 'npm run start -- --ci --no-open -p 6011',
        url: 'http://127.0.0.1:6011',
        timeout: 180000,
        reuseExistingServer: false,
    },
});

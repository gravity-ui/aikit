import {expect, test} from '~playwright/core';

import {RunActivityStories} from './helpersPlaywright';

test.describe('RunActivity', {tag: '@RunActivity'}, () => {
    test('should preserve independent step disclosure', async ({mount}) => {
        const component = await mount(<RunActivityStories.Playground />);
        await component.getByRole('button', {name: 'Read', exact: true}).click();
        const step = component.getByRole('button', {name: 'Read products.ts'});
        await step.click();
        await expect(step).toHaveAttribute('aria-expanded', 'true');
        await component.getByRole('button', {name: 'Read', exact: true}).click();
        await component.getByRole('button', {name: 'Read', exact: true}).click();
        await expect(step).toHaveAttribute('aria-expanded', 'true');
    });
    for (const name of ['Completed', 'Cancelled', 'Error', 'NeedsInput'] as const) {
        test(`should render ${name}`, async ({mount, expectScreenshot}) => {
            const Story = RunActivityStories[name];
            await mount(<Story />);
            await expectScreenshot();
        });
    }
});

import {expect, test} from '~playwright/core';

import {ChatContentV2Stories} from './helpersPlaywright';

test.describe('ChatContentV2', {tag: '@ChatContentV2'}, () => {
    test('should preserve viewport and focus during history disclosure', async ({mount}) => {
        const component = await mount(<ChatContentV2Stories.Playground />);
        const viewport = component.locator('.g-aikit-chat-content-v2__viewport');
        const disclosure = component.getByRole('button', {name: 'Worked for 3 s'});
        await disclosure.focus();
        const top = await viewport.evaluate((el) => el.scrollTop);
        await disclosure.press('Enter');
        await expect(disclosure).toBeFocused();
        await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(top);
        await expect(component.getByRole('button', {name: 'Scroll to bottom'})).toBeVisible();
        await component.getByRole('button', {name: 'Scroll to bottom'}).click();
        await expect
            .poll(() =>
                viewport.evaluate((el) =>
                    Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop),
                ),
            )
            .toBeLessThan(2);
    });
});

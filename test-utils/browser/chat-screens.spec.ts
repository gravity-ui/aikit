import {expect, test} from '@playwright/test';

for (const mobile of [false, true]) {
    test(`welcome, instructions and conversation preserve the draft (${mobile ? 'mobile' : 'desktop'})`, async ({
        page,
    }, testInfo) => {
        await page.setViewportSize(
            mobile ? {width: 390, height: 844} : {width: 1400, height: 1000},
        );
        await page.goto(
            `/iframe.html?id=pages-chatcontainer--${mobile ? 'mobile-screen-navigation' : 'screen-navigation'}&viewMode=story`,
        );
        const prompt = page.getByPlaceholder('Write a message');
        await prompt.fill('Unsent question');
        if (!mobile) {
            await expect(page.getByRole('complementary', {name: 'Example controls'})).toBeVisible();
            await page.setViewportSize({width: 600, height: 1000});
            await page.getByRole('button', {name: 'Example controls', exact: true}).click();
            await expect(page.getByRole('switch', {name: 'Instructions available'})).toBeChecked();
            await page.getByRole('button', {name: 'Done', exact: true}).click();
            await page.setViewportSize({width: 1400, height: 1000});
            await expect(prompt).toHaveValue('Unsent question');
        }
        await page.locator('[data-qa="header-menu-button"]').click();
        await page.getByText('User instructions', {exact: true}).click();
        await expect(prompt).toBeHidden();
        if (mobile) {
            expect(
                await page.evaluate(
                    () => document.documentElement.scrollWidth <= window.innerWidth,
                ),
            ).toBe(true);
        }
        const instructions = page.getByPlaceholder('How should the assistant respond?');
        await expect(page.getByRole('region', {name: 'User instructions'})).toBeFocused();
        await page.screenshot({path: testInfo.outputPath('instructions.png')});
        if (mobile) {
            await page.getByRole('button', {name: 'Example controls', exact: true}).click();
            await expect(page.getByRole('button', {name: 'Done', exact: true})).toBeVisible();
            await page.screenshot({
                path: testInfo.outputPath('controls.png'),
                animations: 'disabled',
            });
            await page.getByRole('button', {name: 'Done', exact: true}).click();
        }
        await instructions.fill('Be concise');
        await page.getByRole('button', {name: 'Back', exact: true}).click();
        await page.getByRole('button', {name: 'Keep editing'}).click();
        await expect(instructions).toHaveValue('Be concise');
        await expect(page.getByText('10 / 2000', {exact: true})).toBeVisible();
        if (mobile) {
            await page.getByRole('button', {name: 'Example controls', exact: true}).click();
        }
        await page.getByText('Fail next save', {exact: true}).click();
        if (mobile) {
            await page.getByRole('button', {name: 'Done', exact: true}).click();
        }
        await page.getByRole('button', {name: 'Save', exact: true}).click();
        await expect(instructions).toBeDisabled();
        await expect(page.getByRole('alert')).toHaveText('Could not save instructions. Try again.');
        await expect(instructions).toHaveValue('Be concise');
        await page.getByRole('button', {name: 'Save', exact: true}).click();
        await expect(prompt).toHaveValue('Unsent question');
        await prompt.press('Enter');
        await expect(page.getByText('Unsent question', {exact: true})).toBeVisible();
        await prompt.fill('Another draft');
        await page.locator('[data-qa="header-menu-button"]').click();
        await page.getByText('User instructions', {exact: true}).click();
        await expect(instructions).toHaveValue('Be concise');
        if (mobile) {
            await page.getByRole('button', {name: 'Example controls', exact: true}).click();
        }
        await page.getByText('Instructions available', {exact: true}).click();
        if (mobile) {
            await page.getByRole('button', {name: 'Done', exact: true}).click();
        }
        await expect(instructions).toBeHidden();
        await expect(prompt).toHaveValue('Another draft');
        await expect(page.locator('[data-qa="header-menu-button"]')).toBeHidden();
    });
}

for (const virtualized of [false, true]) {
    test(`preserves reading position and follow-end intent during background responses (${virtualized ? 'virtualized' : 'plain'})`, async ({
        page,
    }) => {
        await page.goto(
            `/iframe.html?id=pages-chatcontainer--${virtualized ? 'virtualized' : 'streaming'}-screen-navigation&viewMode=story`,
        );
        const scroller = page
            .locator(virtualized ? '.g-aikit-message-list__list' : '.g-aikit-message-list')
            .first();
        await expect(scroller).toBeVisible();
        await expect
            .poll(() => scroller.evaluate((element) => element.scrollTop))
            .toBeGreaterThan(100);
        await scroller.evaluate((element) => {
            element.dispatchEvent(new WheelEvent('wheel', {deltaY: -1000}));
            element.dispatchEvent(new Event('scroll'));
            element.scrollTop = 350;
            element.dispatchEvent(new Event('scroll'));
        });
        await expect
            .poll(() => scroller.evaluate((element) => element.scrollTop))
            .toBeLessThan(400);
        const before = await scroller.evaluate((element) => {
            const top = element.getBoundingClientRect().top;
            const row = Array.from(element.querySelectorAll<HTMLElement>('[data-message-id]')).find(
                (item) => item.getBoundingClientRect().bottom > top,
            )!;
            return {id: row.dataset.messageId, offset: row.getBoundingClientRect().top - top};
        });
        await page.locator('[data-qa="header-menu-button"]').click();
        await page.getByText('User instructions', {exact: true}).click();
        await expect(scroller).toBeHidden();
        await page.getByRole('button', {name: 'Receive response chunk'}).click();
        await page.getByRole('button', {name: 'Back', exact: true}).click();
        await expect(scroller).toBeVisible();
        await expect
            .poll(() =>
                scroller.evaluate((element, anchor) => {
                    const row = Array.from(
                        element.querySelectorAll<HTMLElement>('[data-message-id]'),
                    ).find((item) => item.dataset.messageId === anchor.id);
                    return row
                        ? Math.abs(
                              row.getBoundingClientRect().top -
                                  element.getBoundingClientRect().top -
                                  anchor.offset,
                          )
                        : Infinity;
                }, before),
            )
            .toBeLessThan(15);
        await scroller.evaluate((element) => {
            element.dispatchEvent(new WheelEvent('wheel', {deltaY: 1000}));
            element.scrollTop = element.scrollHeight;
            element.dispatchEvent(new Event('scroll'));
        });
        await page.locator('[data-qa="header-menu-button"]').click();
        await page.getByText('User instructions', {exact: true}).click();
        await page.getByRole('button', {name: 'Receive response chunk'}).click();
        await page.getByRole('button', {name: 'Back', exact: true}).click();
        await expect
            .poll(() =>
                scroller.evaluate(
                    (element) => element.scrollHeight - element.clientHeight - element.scrollTop,
                ),
            )
            .toBeLessThan(15);
    });
}

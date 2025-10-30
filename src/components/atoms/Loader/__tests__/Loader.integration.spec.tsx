import {expect, test} from '@playwright/experimental-ct-react';
import {Loader} from '../Loader';

test.describe('Loader', () => {
    test('should render streaming loader by default', async ({mount}) => {
        const component = await mount(<Loader />);
        await expect(component).toHaveScreenshot();
    });

    test('should render loading view loader', async ({mount}) => {
        const component = await mount(<Loader view="loading" />);
        await expect(component).toHaveScreenshot();
    });
});

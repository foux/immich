import { AssetFileUploadResponseDto, LoginResponseDto, SharedLinkType } from '@immich/sdk';
import { expect, test } from '@playwright/test';
import { utils } from 'src/utils';

test.describe('Detail Panel', () => {
  let admin: LoginResponseDto;
  let asset: AssetFileUploadResponseDto;

  test.beforeAll(async () => {
    utils.initSdk();
    await utils.resetDatabase();
    admin = await utils.adminSetup();
    asset = await utils.createAsset(admin.accessToken);
  });

  test('can be opened for shared links', async ({ page }) => {
    const sharedLink = await utils.createSharedLink(admin.accessToken, {
      type: SharedLinkType.Individual,
      assetIds: [asset.id],
    });
    await page.goto(`/share/${sharedLink.key}/photos/${asset.id}`);
    await page.waitForSelector('#immich-asset-viewer');

    await expect(page.getByRole('button', { name: 'Info' })).toBeVisible();
    await page.keyboard.press('i');
    await expect(page.locator('#detail-panel')).toBeVisible();
    await page.keyboard.press('i');
    await expect(page.locator('#detail-panel')).toHaveCount(0);
  });

  test('cannot be opened for shared links with hidden metadata', async ({ page }) => {
    const sharedLink = await utils.createSharedLink(admin.accessToken, {
      type: SharedLinkType.Individual,
      assetIds: [asset.id],
      showMetadata: false,
    });
    await page.goto(`/share/${sharedLink.key}/photos/${asset.id}`);
    await page.waitForSelector('#immich-asset-viewer');

    await expect(page.getByRole('button', { name: 'Info' })).toHaveCount(0);
    await page.keyboard.press('i');
    await expect(page.locator('#detail-panel')).toHaveCount(0);
    await page.keyboard.press('i');
    await expect(page.locator('#detail-panel')).toHaveCount(0);
  });
});

// e2e/message-edit.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Message edit & delete flow', () => {
  test('post -> edit -> delete', async ({ page }) => {
    // 1) テスト用ユーザーでログイン（メールリンクまたはモック）
    // ここはプロジェクトの認証方式に合わせて実装してください。
    await page.goto('/login');
    // ...ログイン操作...

    // 2) チャンネルに移動
    await page.goto('/channels/TEST_CHANNEL_ID');

    // 3) メッセージ投稿（フォームのセレクタに合わせる）
    await page.fill('textarea[name="message"]', 'テストメッセージ - edit test');
    await page.click('button:has-text("送信")');
    // 確認
    await expect(page.locator('text=テストメッセージ - edit test')).toBeVisible();

    // 4) 編集
    await page.click('button:has-text("編集")'); // 編集ボタンの選択ロジックはより具体的に
    await page.fill('textarea', '編集済みメッセージ');
    await page.click('button:has-text("保存")');
    await expect(page.locator('text=編集済みメッセージ')).toBeVisible();

    // 5) 削除
    await page.click('button:has-text("削除")');
    // confirm ダイアログを扱う場合:
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await expect(page.locator('text=編集済みメッセージ')).not.toBeVisible();
  });
});

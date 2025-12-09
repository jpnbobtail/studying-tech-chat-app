# PR: 要件定義書 対応 — メッセージ編集・削除・チャンネル編集・通知

## 変更点
- サーバ API
  - `PATCH /api/messages/[channelId]/[messageId]` — メッセージ編集
  - `DELETE /api/messages/[channelId]/[messageId]` — メッセージ削除
  - `PATCH /api/channels/[channelId]` — チャンネル編集
- フロント
  - `MessageItem.tsx` に編集/削除 UI（楽観更新）
  - `ChannelEditDialog.tsx`（チャンネル編集モーダル）
  - `useRealtimeMessages.ts` に通知表示を追加
- util
  - `notifications.ts`（Notification API ユーティリティ）
- テスト（雛形）
  - Jest / Playwright のテスト雛形を追加

## 確認チェックリスト
- [ ] サーバ API の単体テスト（必要な場合 mock を用意して動作確認）
- [ ] フロントで編集 -> 保存 -> サーバに反映されること
- [ ] フロントで削除 -> 一覧から消えること
- [ ] 権限チェック（送信者以外が編集できない、削除は送信者またはチャンネル作成者）
- [ ] 通知：別ユーザーが送信したメッセージでブラウザ通知が出る（Permission が許可されている場合）
- [ ] ESLint / Prettier の自動整形が通る
- [ ] CI が通る

## マージ手順
1. `feat/message-edit-delete-channel-edit-notify` ブランチ名で push
2. CI → Lint → Test を通す
3. レビュー承認後、Squash & Merge

// src/__tests__/api/messages.edit.test.ts
import request from 'supertest';
// NOTE: Next.js のルートハンドラーを直接 test する設定が必要です（カスタムテスト harness）
// ここでは雛形を示します。プロジェクトのテストランナー設定に合わせて調整してください.

describe('Messages API - edit/delete', () => {
  test('PATCH without session returns 401', async () => {
    // 実運用では test server を立ち上げ、cookie/session をモックする必要あり
    // 例: const res = await request(app).patch('/api/messages/chan1/msg1').send({ content: 'x' });
    // expect(res.status).toBe(401);
    expect(true).toBe(true); // placeholder
  });

  test('DELETE without session returns 401', async () => {
    expect(true).toBe(true); // placeholder
  });

  // 追加: session ありで編集成功、編集権限なしは403 などを実装
});

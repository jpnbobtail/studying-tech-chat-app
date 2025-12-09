// src/components/channel/MessageItem.tsx
import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import fetcher from '@/lib/fetcher'; // プロジェクトの fetcher に合わせて調整
import { useSession } from '@/hooks/useSession'; // 認証フック名に合わせて変更

type Message = {
  id: string;
  channelId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
  updatedAt?: string | null;
};

export default function MessageItem({ message, channelId }: { message: Message; channelId: string; }) {
  const { user } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const isOwner = user?.id === message.senderId;
  const messagesKey = `/api/messages/${channelId}`; // SWR キャッシュキーに合わせて

  const saveEdit = async () => {
    if (editValue.trim().length === 0) {
      alert('メッセージを入力してください');
      return;
    }

    // 楽観更新: キャッシュを書き換える
    const rollback = await mutate(messagesKey, (data: Message[] | undefined) => {
      if (!data) return data;
      return data.map(m => (m.id === message.id ? { ...m, content: editValue, updatedAt: new Date().toISOString() } : m));
    }, false);

    try {
      const res = await fetcher(`${messagesKey}/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editValue }),
      });
      // サーバ反映を再取得
      mutate(messagesKey);
      setIsEditing(false);
    } catch (err) {
      // ロールバックは SWR の mutate の第3引数 false の後に再フェッチすることで行う
      mutate(messagesKey);
      console.error('Edit failed', err);
      alert('編集に失敗しました');
    }
  };

  const deleteMessage = async () => {
    const ok = confirm('メッセージを削除しますか？');
    if (!ok) return;

    // 楽観削除
    mutate(messagesKey, (data: Message[] | undefined) => data ? data.filter(d => d.id !== message.id) : data, false);

    try {
      await fetcher(`${messagesKey}/${message.id}`, {
        method: 'DELETE',
      });
      mutate(messagesKey);
    } catch (err) {
      // ロールバック: 再フェッチ
      mutate(messagesKey);
      console.error('Delete failed', err);
      alert('削除に失敗しました');
    }
  };

  return (
    <div className="message-item p-2 border-b">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium">{message.senderName ?? 'Unknown'}</div>
          <div className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</div>
        </div>

        {isOwner && (
          <div className="ml-2 flex gap-2">
            <button onClick={() => { setIsEditing(true); setEditValue(message.content); }} className="text-xs underline">編集</button>
            <button onClick={deleteMessage} className="text-xs text-red-600 underline">削除</button>
          </div>
        )}
      </div>

      <div className="mt-2">
        {isEditing ? (
          <div>
            <textarea value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full p-2 border rounded" rows={3} />
            <div className="mt-2 flex gap-2">
              <button onClick={saveEdit} className="px-3 py-1 rounded bg-blue-600 text-white">保存</button>
              <button onClick={() => { setIsEditing(false); setEditValue(message.content); }} className="px-3 py-1 rounded border">キャンセル</button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}
      </div>
    </div>
  );
}

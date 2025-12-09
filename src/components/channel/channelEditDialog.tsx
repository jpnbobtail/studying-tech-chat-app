// src/components/channel/ChannelEditDialog.tsx
import React, { useState } from 'react';
import { mutate } from 'swr';
import fetcher from '@/lib/fetcher';

type Channel = {
  id: string;
  name: string;
  description?: string;
};

export default function ChannelEditDialog({ channel, isOpen, onClose }: { channel: Channel; isOpen: boolean; onClose: () => void; }) {
  const [name, setName] = useState(channel.name);
  const [description, setDescription] = useState(channel.description ?? '');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName(channel.name);
      setDescription(channel.description ?? '');
    }
  }, [isOpen, channel]);

  const save = async () => {
    if (!name.trim()) {
      alert('チャンネル名は必須です');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/channels/${channel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`更新に失敗しました: ${err?.error ?? res.statusText}`);
        setSaving(false);
        return;
      }
      // チャンネル一覧を再取得
      mutate('/api/channels');
      onClose();
    } catch (e) {
      console.error('channel update failed', e);
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <div className="relative bg-white rounded p-6 w-full max-w-md z-10">
        <h3 className="text-lg font-semibold">チャンネルを編集</h3>
        <div className="mt-4">
          <label className="block text-sm">チャンネル名</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div className="mt-4">
          <label className="block text-sm">説明（任意）</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border rounded" rows={4} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">キャンセル</button>
          <button onClick={save} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded">{saving ? '保存中...' : '保存'}</button>
        </div>
      </div>
    </div>
  );
}

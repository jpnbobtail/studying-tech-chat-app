// src/hooks/useRealtimeMessages.ts
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { showNotification, requestNotificationPermission } from '@/lib/notifications';
import useSWR, { mutate } from 'swr';
import fetcher from '@/lib/fetcher';

// supabase client の作成方法はプロジェクトに合わせてください
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function useRealtimeMessages(channelId: string, currentUserId?: string, channelName?: string) {
  const key = `/api/messages/${channelId}`;
  const { data, error } = useSWR(key, () => fetcher(`/api/messages/${channelId}`));

  useEffect(() => {
    if (!channelId) return;
    // Request notification permission lazily (optional)
    requestNotificationPermission().catch(() => { /* ignore */ });

    const channel = supabase.channel(`public:messages:channel:${channelId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Message', filter: `channelId=eq.${channelId}` }, payload => {
        const newMsg = payload.new;
        // update SWR cache
        mutate(key, (msgs: any[] | undefined) => {
          if (!msgs) return [newMsg];
          return [...msgs, newMsg];
        }, false);

        // show notification if message not from current user
        if (newMsg.senderId !== currentUserId) {
          const title = channelName ? `#${channelName} - ${newMsg.senderName}` : `${newMsg.senderName}`;
          const body = newMsg.content.length > 120 ? newMsg.content.slice(0, 117) + '...' : newMsg.content;
          showNotification(title, { body, tag: `msg-${newMsg.id}` });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, currentUserId, channelName]);

  return { messages: data, error };
}

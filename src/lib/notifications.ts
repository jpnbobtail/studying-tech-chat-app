// src/lib/notifications.ts
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Notification permission request failed', e);
    return false;
  }
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, options);
  } catch (e) {
    console.warn('showNotification failed', e);
  }
}

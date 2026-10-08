'use client';

import { useEffect } from 'react';
import { getActiveProfileId } from '@/lib/profiles';
import { sendDueReminders } from '../application/reminders';

const CHECK_EVERY_MS = 30_000;

/** Invisible: registers the service worker and checks every 30 s whether a daily reminder is due. */
export function ReminderRunner() {
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    const check = () => {
      const profileId = getActiveProfileId();
      if (profileId) void sendDueReminders(profileId, new Date());
    };
    check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', check); };
  }, []);
  return null;
}

import webpush from 'web-push';

export interface PushTarget { endpoint: string; p256dh: string; auth: string }
export interface PushPayload { title: string; body: string; url: string; tag: string }

export type PushResult = 'sent' | 'gone' | 'failed';

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let ready = false;
function configure(): void {
  if (ready) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:contact@example.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
    process.env.VAPID_PRIVATE_KEY ?? '',
  );
  ready = true;
}

export async function sendPush(target: PushTarget, payload: PushPayload): Promise<PushResult> {
  configure();
  try {
    await webpush.sendNotification({ endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } }, JSON.stringify(payload), { TTL: 3600 });
    return 'sent';
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    return status === 404 || status === 410 ? 'gone' : 'failed';
  }
}

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PushService {
  private _permission = signal<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  readonly permission = this._permission.asReadonly();
  readonly isGranted  = () => this._permission() === 'granted';

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    this._permission.set(result);
    return result;
  }

  notify(event: string, data: Record<string, any>): boolean {
    if (!this.isGranted() || !document.hidden) return false;

    const config = this.buildNotification(event, data);
    if (!config) return false;

    const n = new Notification(config.title, { body: config.body, icon: 'favicon.ico', tag: event });
    n.onclick = () => { window.focus(); n.close(); };
    return true;
  }

  private buildNotification(event: string, data: Record<string, any>): { title: string; body: string } | null {
    switch (event) {
      case 'chat_reply':
        return {
          title: `BYTE — ${data['mode'] ?? 'Chat'} reply`,
          body: (data['reply'] as string)?.slice(0, 120) ?? 'New message received',
        };
      case 'drill_reminder':
        return {
          title: 'BYTE — Time to drill',
          body: `Pattern "${data['pattern'] ?? 'unknown'}" is due for review`,
        };
      case 'session_complete':
        return {
          title: 'BYTE — Session complete',
          body: `Score: ${data['score'] ?? '—'}/10 · ${data['patterns_found'] ?? 0} patterns identified`,
        };
      default:
        return null;
    }
  }
}

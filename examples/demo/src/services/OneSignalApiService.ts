import { ONESIGNAL_API_KEY, ONESIGNAL_ANDROID_CHANNEL_ID } from '@env';

import { NotificationType } from '../models/NotificationType';
import { UserData, userDataFromJson } from '../models/UserData';

class OneSignalApiService {
  private static _instance: OneSignalApiService;
  private _appId: string = '';

  static getInstance(): OneSignalApiService {
    if (!OneSignalApiService._instance) {
      OneSignalApiService._instance = new OneSignalApiService();
    }
    return OneSignalApiService._instance;
  }

  setAppId(appId: string): void {
    this._appId = appId;
  }

  getAppId(): string {
    return this._appId;
  }

  hasApiKey(): boolean {
    return !!ONESIGNAL_API_KEY?.trim();
  }

  async sendNotification(type: NotificationType, subscriptionId: string): Promise<boolean> {
    let headings: Record<string, string>;
    let contents: Record<string, string>;
    const extra: Record<string, unknown> = {};

    switch (type) {
      case NotificationType.Simple:
        headings = { en: 'Simple Notification' };
        contents = { en: 'This is a simple push notification' };
        break;
      case NotificationType.WithImage:
        headings = { en: 'Image Notification' };
        contents = { en: 'This notification includes an image' };
        extra.big_picture =
          'https://media.onesignal.com/automated_push_templates/ratings_template.png';
        extra.ios_attachments = {
          image: 'https://media.onesignal.com/automated_push_templates/ratings_template.png',
        };
        break;
      case NotificationType.WithSound:
        headings = { en: 'Sound Notification' };
        contents = { en: 'This notification plays a custom sound' };
        extra.ios_sound = 'vine_boom.wav';
        extra.android_channel_id =
          ONESIGNAL_ANDROID_CHANNEL_ID?.trim() || 'b3b015d9-c050-4042-8548-dcc34aa44aa4';
        break;
      default:
        return false;
    }

    return this._postNotification(headings, contents, subscriptionId, extra);
  }

  async sendCustomNotification(
    title: string,
    body: string,
    subscriptionId: string,
  ): Promise<boolean> {
    return this._postNotification({ en: title }, { en: body }, subscriptionId, {});
  }

  private async _postNotification(
    headings: Record<string, string>,
    contents: Record<string, string>,
    subscriptionId: string,
    extra: Record<string, unknown>,
  ): Promise<boolean> {
    try {
      const body = {
        app_id: this._appId,
        include_subscription_ids: [subscriptionId],
        headings,
        contents,
        ...extra,
      };

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.onesignal.v1+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Send notification failed: ${text}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`Send notification error: ${String(err)}`);
      return false;
    }
  }

  async updateLiveActivity(
    activityId: string,
    event: 'update' | 'end',
    eventUpdates: Record<string, unknown> = {},
  ): Promise<boolean> {
    try {
      const url = `https://api.onesignal.com/apps/${this._appId}/live_activities/${activityId}/notifications`;
      const payload: Record<string, unknown> = {
        event,
        event_updates: eventUpdates,
        name: event === 'end' ? 'End Live Activity' : 'Live Activity Update',
        priority: 10,
      };

      if (event === 'end') {
        payload.dismissal_date = Math.floor(Date.now() / 1000);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${ONESIGNAL_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`${event} live activity failed: ${text}`);
        return false;
      }

      return true;
    } catch (err) {
      console.error(`${event} live activity error: ${String(err)}`);
      return false;
    }
  }

  async fetchUser(onesignalId: string): Promise<UserData | null> {
    try {
      const url = `https://api.onesignal.com/apps/${this._appId}/users/by/onesignal_id/${onesignalId}`;
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`fetchUser failed: ${response.status}`);
        return null;
      }
      const json = (await response.json()) as Record<string, unknown>;
      return userDataFromJson(json);
    } catch (err) {
      console.error(`fetchUser error: ${String(err)}`);
      return null;
    }
  }
}

export default OneSignalApiService;

/**
 * OneSignal Notification Sender Service
 *
 * Sends push notifications via OneSignal REST API.
 * Ported from Android SDK demo app's OneSignalNotificationSender.java
 *
 * WARNING: This implementation sends notifications directly from the client app
 * using the REST API key. This is NOT SAFE for production use. In production apps,
 * API calls should be made from a secure backend server.
 *
 * This approach is acceptable for:
 * - Demo and example applications
 * - Internal testing and development
 * - Educational purposes
 */

import { OneSignal } from 'react-native-onesignal';
import { NotificationPayload } from '../constants/NotificationPayloads';
import { APP_ID, REST_API_KEY, ONESIGNAL_API_URL } from '../constants/Config';
import { Platform } from 'react-native';

/**
 * OneSignal API payload structure
 */
interface OneSignalAPIPayload {
  app_id: string;
  include_player_ids: string[];
  headings?: { en: string };
  contents: { en: string };
  small_icon?: string;
  large_icon?: string;
  big_picture?: string;
  buttons?: Array<{ id: string; text: string; icon: string }>;
  android_group?: string;
  android_led_color?: string;
  android_accent_color?: string;
  android_sound?: string;
  ios_badgeType?: string;
  ios_badgeCount?: number;
}

/**
 * Gets the current device's push subscription ID (player ID)
 *
 * @returns Promise that resolves to the player ID or null if not subscribed
 */
async function getPushSubscriptionId(): Promise<string | null> {
  try {
    // Get the push subscription ID from OneSignal SDK
    const playerId = await OneSignal.User.pushSubscription.getIdAsync();

    if (!playerId) {
      console.warn(
        '[NotificationSender] No push subscription ID found. User may not be subscribed.',
      );
      return null;
    }

    return playerId;
  } catch (error) {
    console.error(
      '[NotificationSender] Error getting push subscription ID:',
      error,
    );
    return null;
  }
}

/**
 * Checks if the user is opted in to push notifications
 *
 * @returns Promise that resolves to true if opted in, false otherwise
 */
async function isUserOptedIn(): Promise<boolean> {
  try {
    const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
    return optedIn;
  } catch (error) {
    console.error('[NotificationSender] Error checking opt-in status:', error);
    return false;
  }
}

/**
 * Builds the OneSignal API payload from a notification template
 *
 * @param template The notification payload template
 * @param playerId The device's player ID to target
 * @returns The complete OneSignal API payload
 */
function buildNotificationPayload(
  template: NotificationPayload,
  playerId: string,
): OneSignalAPIPayload {
  const payload: OneSignalAPIPayload = {
    app_id: APP_ID,
    include_player_ids: [playerId],
    contents: { en: template.content },
  };

  // Add optional heading if present
  if (template.heading) {
    payload.headings = { en: template.heading };
  }

  // Add large icon if present
  if (template.largeIcon) {
    payload.large_icon = template.largeIcon;
  }

  // Add big picture if present
  if (template.bigPicture) {
    payload.big_picture = template.bigPicture;
  }

  // Add action buttons if present
  if (template.buttons && template.buttons.length > 0) {
    payload.buttons = template.buttons;
  }

  // Android-specific styling (matching Android demo app)
  if (Platform.OS === 'android') {
    payload.small_icon = 'ic_stat_onesignal_default'; // Default OneSignal small icon
    payload.android_group = 'onesignal_demo';
    payload.android_led_color = 'FFE9444E'; // Red LED color
    payload.android_accent_color = 'FFE9444E'; // Red accent color
    payload.android_sound = 'nil'; // Default sound
  }

  // iOS-specific settings
  if (Platform.OS === 'ios') {
    payload.ios_badgeType = 'Increase';
    payload.ios_badgeCount = 1;
  }

  return payload;
}

/**
 * Sends a push notification to the current device via OneSignal REST API
 *
 * @param template The notification payload template to send
 * @throws Error if user is not subscribed, API key is missing, or API call fails
 */
export async function sendNotification(
  template: NotificationPayload,
): Promise<void> {
  // Validate REST API key is configured
  if (!REST_API_KEY || REST_API_KEY === 'YOUR_REST_API_KEY_HERE') {
    throw new Error(
      'REST API Key not configured. Please add your OneSignal REST API Key to constants/Config.ts',
    );
  }

  // Check if user is opted in
  const optedIn = await isUserOptedIn();
  if (!optedIn) {
    throw new Error(
      'User is not opted in to push notifications. Please enable notifications in settings.',
    );
  }

  // Get push subscription ID
  const playerId = await getPushSubscriptionId();
  if (!playerId) {
    throw new Error(
      'No push subscription ID found. User may not be properly subscribed to push notifications.',
    );
  }

  console.log(
    '[NotificationSender] Sending notification to player ID:',
    playerId,
  );

  // Build the API payload
  const payload = buildNotificationPayload(template, playerId);

  console.log(
    '[NotificationSender] Notification payload:',
    JSON.stringify(payload, null, 2),
  );

  try {
    // Make HTTP POST request to OneSignal API
    const response = await fetch(ONESIGNAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${REST_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[NotificationSender] API error response:', errorText);

      if (response.status === 400) {
        throw new Error(`Invalid request: ${errorText}`);
      } else if (response.status === 401) {
        throw new Error('Invalid REST API Key. Check your Config.ts file.');
      } else {
        throw new Error(
          `OneSignal API error (${response.status}): ${errorText}`,
        );
      }
    }

    // Parse success response
    const result = await response.json();
    console.log('[NotificationSender] Notification sent successfully:', result);

    // Check if notification was actually sent
    if (result.recipients === 0) {
      console.warn(
        '[NotificationSender] Warning: Notification sent but no recipients received it.',
      );
    }
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      console.error(
        '[NotificationSender] Failed to send notification:',
        error.message,
      );
      throw error;
    } else {
      console.error('[NotificationSender] Unknown error:', error);
      throw new Error('Failed to send notification: Unknown error');
    }
  }
}

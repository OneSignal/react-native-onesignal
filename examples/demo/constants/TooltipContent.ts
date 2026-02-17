/**
 * Tooltip content for all sections
 * Matches Android V2 demo app tooltip_content.json
 */

export interface TooltipOption {
  name: string;
  description: string;
}

export interface TooltipData {
  title: string;
  description: string;
  options?: TooltipOption[];
}

export const TooltipContent: Record<string, TooltipData> = {
  app: {
    title: 'App',
    description:
      'Configure your OneSignal App ID and manage user login/logout.',
  },
  aliases: {
    title: 'Aliases',
    description:
      'Aliases are alternative identifiers for the user. Use them to reference users by your own IDs (e.g., database ID, username).',
  },
  push: {
    title: 'Push Subscription',
    description:
      'The push subscription ID for this device. Used to send targeted push notifications.',
  },
  emails: {
    title: 'Email Subscriptions',
    description:
      'Email addresses associated with this user for email messaging campaigns.',
  },
  sms: {
    title: 'SMS Subscriptions',
    description:
      'Phone numbers associated with this user for SMS messaging.',
  },
  tags: {
    title: 'Tags',
    description:
      'Key-value data attached to the user for segmentation and personalization.',
  },
  triggers: {
    title: 'Triggers',
    description:
      'Local triggers that control when in-app messages are displayed. Stored in memory only - cleared on app restart.',
  },
  outcomes: {
    title: 'Outcomes',
    description:
      'Track user actions and conversions attributed to OneSignal messaging.',
  },
  inAppMessaging: {
    title: 'In-App Messaging',
    description:
      'Display rich messages inside your app based on user behavior and segments.',
  },
  location: {
    title: 'Location',
    description:
      'Share device location for location-based targeting and analytics.',
  },
  trackEvent: {
    title: 'Track Event',
    description:
      'Track custom events with optional properties for analytics and segmentation.',
  },
  sendPushNotification: {
    title: 'Send Push Notification',
    description: 'Test push notifications by sending them to this device.',
    options: [
      {
        name: 'Simple',
        description: 'Basic push notification with title and body text only.',
      },
      {
        name: 'With Image',
        description:
          'Push notification with a large image attachment (big picture style).',
      },
      {
        name: 'Custom',
        description:
          'Create a custom notification with your own title and message content.',
      },
    ],
  },
  sendInAppMessage: {
    title: 'Send In-App Message',
    description:
      'Test in-app message display formats. These trigger local IAMs for testing UI layouts.',
    options: [
      {
        name: 'Top Banner',
        description:
          'Slides in from the top of the screen. Best for non-intrusive alerts and quick info.',
      },
      {
        name: 'Bottom Banner',
        description:
          'Slides in from the bottom of the screen. Great for prompts and soft CTAs.',
      },
      {
        name: 'Center Modal',
        description:
          'Centered popup dialog. Ideal for important announcements requiring user attention.',
      },
      {
        name: 'Full Screen',
        description:
          'Takes over the entire screen. Best for onboarding, promotions, or rich media content.',
      },
    ],
  },
  liveActivities: {
    title: 'Live Activities',
    description:
      'iOS Live Activities allow you to display real-time information on the Lock Screen and Dynamic Island.',
  },
  navigation: {
    title: 'Navigation',
    description: 'Test navigation between screens in the app.',
  },
};

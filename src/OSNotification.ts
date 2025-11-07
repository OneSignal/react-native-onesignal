import { NativeModules, Platform } from 'react-native';
const RNOneSignal = NativeModules.OneSignal;

export interface BaseNotificationData {
  body: string;
  sound?: string;
  title?: string;
  launchURL?: string;
  rawPayload: object | string; // platform bridges return different types
  actionButtons?: object[];
  additionalData?: object;
  notificationId: string;
}

interface AndroidNotificationData extends BaseNotificationData {
  groupKey?: string;
  groupMessage?: string;
  ledColor?: string;
  priority?: number;
  smallIcon?: string;
  largeIcon?: string;
  bigPicture?: string;
  collapseId?: string;
  fromProjectNumber?: string;
  smallIconAccentColor?: string;
  lockScreenVisibility?: string;
  androidNotificationId?: number;
}

interface iOSNotificationData extends BaseNotificationData {
  badge?: string;
  badgeIncrement?: string;
  category?: string;
  threadId?: string;
  subtitle?: string;
  templateId?: string;
  templateName?: string;
  attachments?: object;
  mutableContent?: boolean;
  contentAvailable?: string;
  relevanceScore?: number;
  interruptionLevel?: string;
}

export default class OSNotification {
  body: string;
  sound?: string;
  title?: string;
  launchURL?: string;
  rawPayload: object | string; // platform bridges return different types
  actionButtons?: object[];
  additionalData?: object;
  notificationId: string;
  // android only
  groupKey?: string;
  groupMessage?: string;
  ledColor?: string;
  priority?: number;
  smallIcon?: string;
  largeIcon?: string;
  bigPicture?: string;
  collapseId?: string;
  fromProjectNumber?: string;
  smallIconAccentColor?: string;
  lockScreenVisibility?: string;
  androidNotificationId?: number;
  // ios only
  badge?: string;
  badgeIncrement?: string;
  category?: string;
  threadId?: string;
  subtitle?: string;
  templateId?: string;
  templateName?: string;
  attachments?: object;
  mutableContent?: boolean;
  contentAvailable?: string;
  relevanceScore?: number;
  interruptionLevel?: string;

  constructor(receivedEvent: AndroidNotificationData | iOSNotificationData) {
    this.body = receivedEvent.body;
    this.sound = receivedEvent.sound;
    this.title = receivedEvent.title;
    this.launchURL = receivedEvent.launchURL;
    this.rawPayload = receivedEvent.rawPayload;
    this.actionButtons = receivedEvent.actionButtons;
    this.additionalData = receivedEvent.additionalData;
    this.notificationId = receivedEvent.notificationId;

    /* v8 ignore else -- @preserve */
    if (isAndroidNotificationData(receivedEvent)) {
      this.groupKey = receivedEvent.groupKey;
      this.ledColor = receivedEvent.ledColor;
      this.priority = receivedEvent.priority;
      this.smallIcon = receivedEvent.smallIcon;
      this.largeIcon = receivedEvent.largeIcon;
      this.bigPicture = receivedEvent.bigPicture;
      this.collapseId = receivedEvent.collapseId;
      this.groupMessage = receivedEvent.groupMessage;
      this.fromProjectNumber = receivedEvent.fromProjectNumber;
      this.smallIconAccentColor = receivedEvent.smallIconAccentColor;
      this.lockScreenVisibility = receivedEvent.lockScreenVisibility;
      this.androidNotificationId = receivedEvent.androidNotificationId;
    } else if (isiOSNotificationData(receivedEvent)) {
      this.badge = receivedEvent.badge;
      this.category = receivedEvent.category;
      this.threadId = receivedEvent.threadId;
      this.subtitle = receivedEvent.subtitle;
      this.templateId = receivedEvent.templateId;
      this.attachments = receivedEvent.attachments;
      this.templateName = receivedEvent.templateName;
      this.mutableContent = receivedEvent.mutableContent;
      this.badgeIncrement = receivedEvent.badgeIncrement;
      this.contentAvailable = receivedEvent.contentAvailable;
      this.relevanceScore = receivedEvent.relevanceScore;
      this.interruptionLevel = receivedEvent.interruptionLevel;
    }
  }

  display(): void {
    RNOneSignal.displayNotification(this.notificationId);
    return;
  }
}

const isAndroidNotificationData = (
  _data: AndroidNotificationData | iOSNotificationData,
): _data is AndroidNotificationData => {
  return Platform.OS === 'android';
};

const isiOSNotificationData = (
  _data: AndroidNotificationData | iOSNotificationData,
): _data is iOSNotificationData => {
  return Platform.OS === 'ios';
};

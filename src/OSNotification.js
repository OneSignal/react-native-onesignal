import { Platform } from 'react-native';

export default class OSNotification {
    constructor(receivedEvent) {
        this.body = receivedEvent.body;
        this.sound = receivedEvent.sound;
        this.title = receivedEvent.title;
        this.launchURL = receivedEvent.launchURL;
        this.rawPayload = receivedEvent.rawPayload;
        this.actionButtons = receivedEvent.actionButtons;
        this.additionalData = receivedEvent.additionalData;
        this.notificationId = receivedEvent.notificationId;

        if (Platform.OS === 'android') {
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
            this.lockScreenVisibility = receivedEvent.lockScreenVisibililty;
            this.androidNotificationId = receivedEvent.androidNotificationId;
        }

        if (Platform.OS === 'ios') {
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
}

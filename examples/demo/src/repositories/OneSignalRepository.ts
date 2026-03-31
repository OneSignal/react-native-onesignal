import { OneSignal } from 'react-native-onesignal';

import { NotificationType } from '../models/NotificationType';
import { UserData } from '../models/UserData';
import OneSignalApiService from '../services/OneSignalApiService';

class OneSignalRepository {
  private apiService: OneSignalApiService;

  constructor(apiService: OneSignalApiService) {
    this.apiService = apiService;
  }

  // User
  loginUser(externalUserId: string): void {
    OneSignal.login(externalUserId);
  }

  logoutUser(): void {
    OneSignal.logout();
  }

  // Aliases
  addAlias(label: string, id: string): void {
    OneSignal.User.addAlias(label, id);
  }

  addAliases(aliases: Record<string, string>): void {
    OneSignal.User.addAliases(aliases);
  }

  // Email
  addEmail(email: string): void {
    OneSignal.User.addEmail(email);
  }

  removeEmail(email: string): void {
    OneSignal.User.removeEmail(email);
  }

  // SMS
  addSms(smsNumber: string): void {
    OneSignal.User.addSms(smsNumber);
  }

  removeSms(smsNumber: string): void {
    OneSignal.User.removeSms(smsNumber);
  }

  // Tags
  addTag(key: string, value: string): void {
    OneSignal.User.addTag(key, value);
  }

  addTags(tags: Record<string, string>): void {
    OneSignal.User.addTags(tags);
  }

  removeTags(keys: string[]): void {
    OneSignal.User.removeTags(keys);
  }

  // Triggers
  addTrigger(key: string, value: string): void {
    OneSignal.InAppMessages.addTrigger(key, value);
  }

  addTriggers(triggers: Record<string, string>): void {
    OneSignal.InAppMessages.addTriggers(triggers);
  }

  removeTriggers(keys: string[]): void {
    OneSignal.InAppMessages.removeTriggers(keys);
  }

  clearTriggers(): void {
    OneSignal.InAppMessages.clearTriggers();
  }

  // Outcomes
  sendOutcome(name: string): void {
    OneSignal.Session.addOutcome(name);
  }

  sendUniqueOutcome(name: string): void {
    OneSignal.Session.addUniqueOutcome(name);
  }

  sendOutcomeWithValue(name: string, value: number): void {
    OneSignal.Session.addOutcomeWithValue(name, value);
  }

  // Track Event
  trackEvent(name: string, properties?: Record<string, unknown>): void {
    OneSignal.User.trackEvent(name, properties);
  }

  // Push Subscription
  async getPushSubscriptionIdAsync(): Promise<string | undefined> {
    const id = await OneSignal.User.pushSubscription.getIdAsync();
    return id ?? undefined;
  }

  async isPushOptedInAsync(): Promise<boolean> {
    return OneSignal.User.pushSubscription.getOptedInAsync();
  }

  optInPush(): void {
    OneSignal.User.pushSubscription.optIn();
  }

  optOutPush(): void {
    OneSignal.User.pushSubscription.optOut();
  }

  // Notifications
  async hasPermission(): Promise<boolean> {
    return OneSignal.Notifications.getPermissionAsync();
  }

  async requestPermission(fallbackToSettings: boolean): Promise<boolean> {
    return OneSignal.Notifications.requestPermission(fallbackToSettings);
  }

  clearAllNotifications(): void {
    OneSignal.Notifications.clearAll();
  }

  // In-App Messages
  setPaused(paused: boolean): void {
    OneSignal.InAppMessages.setPaused(paused);
  }

  // Location
  setLocationShared(shared: boolean): void {
    OneSignal.Location.setShared(shared);
  }

  requestLocationPermission(): void {
    OneSignal.Location.requestPermission();
  }

  // Privacy Consent
  setConsentRequired(required: boolean): void {
    OneSignal.setConsentRequired(required);
  }

  setConsentGiven(granted: boolean): void {
    OneSignal.setConsentGiven(granted);
  }

  // User IDs
  async getExternalId(): Promise<string | undefined> {
    const id = await OneSignal.User.getExternalId();
    return id ?? undefined;
  }

  async getOnesignalId(): Promise<string | undefined> {
    const id = await OneSignal.User.getOnesignalId();
    return id ?? undefined;
  }

  // Notification sending (via REST API)
  async sendNotification(type: NotificationType): Promise<boolean> {
    const subscriptionId = await this.getPushSubscriptionIdAsync();
    if (!subscriptionId) {
      return false;
    }
    return this.apiService.sendNotification(type, subscriptionId);
  }

  async sendCustomNotification(title: string, body: string): Promise<boolean> {
    const subscriptionId = await this.getPushSubscriptionIdAsync();
    if (!subscriptionId) {
      return false;
    }
    return this.apiService.sendCustomNotification(title, body, subscriptionId);
  }

  async fetchUser(onesignalId: string): Promise<UserData | null> {
    return this.apiService.fetchUser(onesignalId);
  }

  // Live Activities
  startDefaultLiveActivity(activityId: string, attributes: object, content: object): void {
    OneSignal.LiveActivities.startDefault(activityId, attributes, content);
  }

  async updateLiveActivity(
    activityId: string,
    event: 'update' | 'end',
    eventUpdates?: Record<string, unknown>,
  ): Promise<boolean> {
    return this.apiService.updateLiveActivity(activityId, event, eventUpdates);
  }

  exitLiveActivity(activityId: string): void {
    OneSignal.LiveActivities.exit(activityId);
  }
}

export default OneSignalRepository;

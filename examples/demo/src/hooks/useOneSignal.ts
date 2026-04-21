import { ONESIGNAL_APP_ID } from '@env';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  LogLevel,
  OneSignal,
  type InAppMessageClickEvent,
  type InAppMessageDidDismissEvent,
  type InAppMessageDidDisplayEvent,
  type InAppMessageWillDismissEvent,
  type InAppMessageWillDisplayEvent,
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
  type UserChangedState,
} from 'react-native-onesignal';

import { NotificationType } from '../models/NotificationType';
import OneSignalApiService from '../services/OneSignalApiService';
import PreferencesService from '../services/PreferencesService';

const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

function resolveAppId(): string {
  return ONESIGNAL_APP_ID?.trim() || DEFAULT_APP_ID;
}

const apiService = OneSignalApiService.getInstance();
const preferences = PreferencesService.getInstance();

async function postNotification(type: NotificationType): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendNotification(type, subscriptionId);
}

async function postCustomNotification(title: string, body: string): Promise<boolean> {
  const subscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
  if (!subscriptionId) return false;
  return apiService.sendCustomNotification(title, body, subscriptionId);
}

function toPairs(pairs: Record<string, string>): [string, string][] {
  return Object.entries(pairs).map(([key, value]) => [key, value]);
}

export type UseOneSignalReturn = {
  appId: string;
  consentRequired: boolean;
  privacyConsentGiven: boolean;
  externalUserId: string | undefined;
  pushSubscriptionId: string | undefined;
  isPushEnabled: boolean;
  hasNotificationPermission: boolean;
  inAppMessagesPaused: boolean;
  locationShared: boolean;
  aliasesList: [string, string][];
  emailsList: string[];
  smsNumbersList: string[];
  tagsList: [string, string][];
  triggersList: [string, string][];
  isLoading: boolean;
  isReady: boolean;
  loginUser: (externalUserId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setConsentRequired: (required: boolean) => Promise<void>;
  setConsentGiven: (granted: boolean) => Promise<void>;
  promptPush: () => void;
  setPushEnabled: (enabled: boolean) => void;
  sendNotification: (type: NotificationType) => Promise<void>;
  sendCustomNotification: (title: string, body: string) => Promise<void>;
  clearAllNotifications: () => void;
  setIamPaused: (paused: boolean) => Promise<void>;
  sendIamTrigger: (iamType: string) => void;
  addAlias: (label: string, id: string) => void;
  addAliases: (pairs: Record<string, string>) => void;
  addEmail: (email: string) => void;
  removeEmail: (email: string) => void;
  addSms: (sms: string) => void;
  removeSms: (sms: string) => void;
  addTag: (key: string, value: string) => void;
  addTags: (pairs: Record<string, string>) => void;
  removeSelectedTags: (keys: string[]) => void;
  sendOutcome: (name: string) => void;
  sendUniqueOutcome: (name: string) => void;
  sendOutcomeWithValue: (name: string, value: number) => void;
  addTrigger: (key: string, value: string) => void;
  addTriggers: (pairs: Record<string, string>) => void;
  removeSelectedTriggers: (keys: string[]) => void;
  clearTriggers: () => void;
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  setLocationShared: (shared: boolean) => Promise<void>;
  checkLocationShared: () => Promise<boolean>;
  requestLocationPermission: () => void;
  startDefaultLiveActivity: (activityId: string, attributes: object, content: object) => void;
  updateLiveActivity: (activityId: string, eventUpdates: Record<string, unknown>) => Promise<void>;
  endLiveActivity: (activityId: string) => Promise<void>;
};

function useOneSignalState(): UseOneSignalReturn {
  const [appId, setAppId] = useState(resolveAppId);
  const [consentRequired, setConsentRequiredState] = useState(false);
  const [privacyConsentGiven, setPrivacyConsentGivenState] = useState(false);
  const [externalUserId, setExternalUserId] = useState<string | undefined>(undefined);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | undefined>(undefined);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [inAppMessagesPaused, setInAppMessagesPaused] = useState(false);
  const [locationShared, setLocationSharedState] = useState(false);
  const [aliasesList, setAliasesList] = useState<[string, string][]>([]);
  const [emailsList, setEmailsList] = useState<string[]>([]);
  const [smsNumbersList, setSmsNumbersList] = useState<string[]>([]);
  const [tagsList, setTagsList] = useState<[string, string][]>([]);
  const [triggersList, setTriggersList] = useState<[string, string][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const requestSequenceRef = useRef(0);

  const fetchUserDataFromApi = useCallback(async () => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);

    try {
      const onesignalId = await OneSignal.User.getOnesignalId();
      if (!onesignalId) return;

      const userData = await apiService.fetchUser(onesignalId);
      if (!userData) return;

      const externalId = await OneSignal.User.getExternalId();

      if (requestSequenceRef.current !== requestId) return;

      setAliasesList(Object.entries(userData.aliases));
      setTagsList(Object.entries(userData.tags));
      setEmailsList(userData.emails);
      setSmsNumbersList(userData.smsNumbers);
      setExternalUserId(externalId ?? userData.externalId);
    } finally {
      if (requestSequenceRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleIamWillDisplay = (e: InAppMessageWillDisplayEvent) => {
      console.log(`IAM willDisplay: ${e.message.messageId}`);
    };

    const handleIamDidDisplay = (e: InAppMessageDidDisplayEvent) => {
      console.log(`IAM didDisplay: ${e.message.messageId}`);
    };

    const handleIamWillDismiss = (e: InAppMessageWillDismissEvent) => {
      console.log(`IAM willDismiss: ${e.message.messageId}`);
    };

    const handleIamDidDismiss = (e: InAppMessageDidDismissEvent) => {
      console.log(`IAM didDismiss: ${e.message.messageId}`);
    };

    const handleIamClick = (e: InAppMessageClickEvent) => {
      console.log(`IAM click: ${e.result.actionId ?? 'unknown'}`);
    };

    const handleNotificationClick = (e: NotificationClickEvent) => {
      console.log(`Notification click: ${e.notification.title ?? ''}`);
    };

    const handleForegroundWillDisplay = (e: NotificationWillDisplayEvent) => {
      console.log(`Notification foregroundWillDisplay: ${e.getNotification().title ?? ''}`);
      e.getNotification().display();
    };

    const pushSubHandler = async () => {
      const [id, optedIn] = await Promise.all([
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
      ]);
      setPushSubscriptionId(id ?? undefined);
      setIsPushEnabled(optedIn);
    };

    const permissionHandler = async () => {
      setHasNotificationPermission(await OneSignal.Notifications.getPermissionAsync());
    };

    const userChangeHandler = (event: UserChangedState) => {
      const nextOnesignalId = event.current.onesignalId ?? null;
      console.log(
        `User changed: onesignalId=${nextOnesignalId ?? 'null'}, externalId=${event.current.externalId ?? 'null'}`,
      );

      if (nextOnesignalId === null) {
        return;
      }

      fetchUserDataFromApi();
    };

    const load = async () => {
      const nextAppId = resolveAppId();
      const [nextConsentRequired, nextPrivacyConsentGiven, nextIamPaused, nextLocationShared] =
        await Promise.all([
          preferences.getConsentRequired(),
          preferences.getPrivacyConsent(),
          preferences.getIamPaused(),
          preferences.getLocationShared(),
        ]);
      const storedExternalUserId = (await preferences.getExternalUserId()) ?? undefined;

      apiService.setAppId(nextAppId);

      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.setConsentRequired(nextConsentRequired);
      OneSignal.setConsentGiven(nextPrivacyConsentGiven);
      OneSignal.initialize(nextAppId);

      OneSignal.LiveActivities.setupDefault({
        enablePushToStart: true,
        enablePushToUpdate: true,
      });

      OneSignal.InAppMessages.setPaused(nextIamPaused);
      OneSignal.Location.setShared(nextLocationShared);

      if (storedExternalUserId) {
        OneSignal.login(storedExternalUserId);
      }

      OneSignal.InAppMessages.addEventListener('willDisplay', handleIamWillDisplay);
      OneSignal.InAppMessages.addEventListener('didDisplay', handleIamDidDisplay);
      OneSignal.InAppMessages.addEventListener('willDismiss', handleIamWillDismiss);
      OneSignal.InAppMessages.addEventListener('didDismiss', handleIamDidDismiss);
      OneSignal.InAppMessages.addEventListener('click', handleIamClick);
      OneSignal.Notifications.addEventListener('click', handleNotificationClick);
      OneSignal.Notifications.addEventListener('permissionChange', permissionHandler);
      OneSignal.Notifications.addEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );

      OneSignal.User.pushSubscription.addEventListener('change', pushSubHandler);
      OneSignal.User.addEventListener('change', userChangeHandler);

      console.log(`OneSignal initialized with app ID: ${nextAppId}`);

      const externalId = await OneSignal.User.getExternalId();
      const [pushId, pushOptedIn, hasPerm] = await Promise.all([
        OneSignal.User.pushSubscription.getIdAsync(),
        OneSignal.User.pushSubscription.getOptedInAsync(),
        OneSignal.Notifications.getPermissionAsync(),
      ]);

      setAppId(nextAppId);
      setConsentRequiredState(nextConsentRequired);
      setPrivacyConsentGivenState(nextPrivacyConsentGiven);
      setInAppMessagesPaused(nextIamPaused);
      setLocationSharedState(nextLocationShared);
      setExternalUserId(externalId ?? storedExternalUserId);
      setPushSubscriptionId(pushId ?? undefined);
      setIsPushEnabled(pushOptedIn);
      setHasNotificationPermission(hasPerm);
      setIsReady(true);

      const initialOnesignalId = await OneSignal.User.getOnesignalId();
      if (initialOnesignalId) {
        await fetchUserDataFromApi();
      }
    };

    void load().catch((err) => {
      console.error(`Initial load error: ${String(err)}`);
      setIsLoading(false);
    });

    return () => {
      OneSignal.InAppMessages.removeEventListener('willDisplay', handleIamWillDisplay);
      OneSignal.InAppMessages.removeEventListener('didDisplay', handleIamDidDisplay);
      OneSignal.InAppMessages.removeEventListener('willDismiss', handleIamWillDismiss);
      OneSignal.InAppMessages.removeEventListener('didDismiss', handleIamDidDismiss);
      OneSignal.InAppMessages.removeEventListener('click', handleIamClick);
      OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
      OneSignal.Notifications.removeEventListener('permissionChange', permissionHandler);
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );
      OneSignal.User.pushSubscription.removeEventListener('change', pushSubHandler);
      OneSignal.User.removeEventListener('change', userChangeHandler);
    };
  }, [fetchUserDataFromApi]);

  const loginUser = async (nextExternalUserId: string) => {
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
    setIsLoading(true);

    try {
      OneSignal.login(nextExternalUserId);
      await preferences.setExternalUserId(nextExternalUserId);
      setExternalUserId(nextExternalUserId);
      console.log(`Logged in as: ${nextExternalUserId}`);
      // The user 'change' listener runs fetchUserDataFromApi once the new
      // onesignalId is assigned; that call clears isLoading in its finally.
    } catch (err) {
      console.error(`Login error: ${String(err)}`);
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    OneSignal.logout();
    await preferences.setExternalUserId(null);
    setExternalUserId(undefined);
    setAliasesList([]);
    setEmailsList([]);
    setSmsNumbersList([]);
    setTagsList([]);
    setTriggersList([]);
    console.log('Logged out');
  };

  const setConsentRequired = async (required: boolean) => {
    setConsentRequiredState(required);
    OneSignal.setConsentRequired(required);
    await preferences.setConsentRequired(required);
  };

  const setConsentGiven = async (granted: boolean) => {
    setPrivacyConsentGivenState(granted);
    OneSignal.setConsentGiven(granted);
    await preferences.setPrivacyConsent(granted);
  };

  const promptPush = () => {
    OneSignal.Notifications.requestPermission(true);
  };

  const setPushEnabled = (enabled: boolean) => {
    if (enabled) {
      OneSignal.User.pushSubscription.optIn();
    } else {
      OneSignal.User.pushSubscription.optOut();
    }
    setIsPushEnabled(enabled);
    console.log(enabled ? 'Push enabled' : 'Push disabled');
  };

  const sendNotification = async (type: NotificationType) => {
    const success = await postNotification(type);
    console.log(success ? `Notification sent: ${type}` : 'Failed to send notification');
  };

  const sendCustomNotification = async (title: string, body: string) => {
    const success = await postCustomNotification(title, body);
    console.log(success ? `Notification sent: ${title}` : 'Failed to send notification');
  };

  const clearAllNotifications = () => {
    OneSignal.Notifications.clearAll();
    console.log('All notifications cleared');
  };

  const setIamPaused = async (paused: boolean) => {
    setInAppMessagesPaused(paused);
    OneSignal.InAppMessages.setPaused(paused);
    await preferences.setIamPaused(paused);
    console.log(paused ? 'In-app messages paused' : 'In-app messages resumed');
  };

  const sendIamTrigger = (iamType: string) => {
    OneSignal.InAppMessages.addTrigger('iam_type', iamType);
    setTriggersList((prev) => {
      const filtered = prev.filter(([key]) => key !== 'iam_type');
      return [...filtered, ['iam_type', iamType] as [string, string]];
    });
    console.log(`Sent In-App Message: ${iamType}`);
  };

  const addAlias = (label: string, id: string) => {
    OneSignal.User.addAlias(label, id);
    setAliasesList((prev) => [...prev, [label, id]]);
    console.log(`Alias added: ${label}`);
  };

  const addAliases = (pairs: Record<string, string>) => {
    OneSignal.User.addAliases(pairs);
    const newEntries = toPairs(pairs);
    setAliasesList((prev) => [...prev, ...newEntries]);
    console.log(`${newEntries.length} alias(es) added`);
  };

  const addEmail = (email: string) => {
    OneSignal.User.addEmail(email);
    setEmailsList((prev) => [...prev.filter((value) => value !== email), email]);
    console.log(`Email added: ${email}`);
  };

  const removeEmail = (email: string) => {
    OneSignal.User.removeEmail(email);
    setEmailsList((prev) => prev.filter((value) => value !== email));
    console.log(`Email removed: ${email}`);
  };

  const addSms = (sms: string) => {
    OneSignal.User.addSms(sms);
    setSmsNumbersList((prev) => [...prev.filter((value) => value !== sms), sms]);
    console.log(`SMS added: ${sms}`);
  };

  const removeSms = (sms: string) => {
    OneSignal.User.removeSms(sms);
    setSmsNumbersList((prev) => prev.filter((value) => value !== sms));
    console.log(`SMS removed: ${sms}`);
  };

  const addTag = (key: string, value: string) => {
    OneSignal.User.addTag(key, value);
    setTagsList((prev) => {
      const filtered = prev.filter(([k]) => k !== key);
      return [...filtered, [key, value]];
    });
    console.log(`Tag added: ${key}`);
  };

  const addTags = (pairs: Record<string, string>) => {
    OneSignal.User.addTags(pairs);
    const newEntries = toPairs(pairs);
    setTagsList((prev) => {
      const keys = new Set(newEntries.map(([k]) => k));
      return [...prev.filter(([k]) => !keys.has(k)), ...newEntries];
    });
    console.log(`${newEntries.length} tag(s) added`);
  };

  const removeSelectedTags = (keys: string[]) => {
    OneSignal.User.removeTags(keys);
    const keySet = new Set(keys);
    setTagsList((prev) => prev.filter(([k]) => !keySet.has(k)));
    console.log(`${keys.length} tag(s) removed`);
  };

  const sendOutcome = (name: string) => {
    OneSignal.Session.addOutcome(name);
    console.log(`Outcome sent: ${name}`);
  };

  const sendUniqueOutcome = (name: string) => {
    OneSignal.Session.addUniqueOutcome(name);
    console.log(`Unique outcome sent: ${name}`);
  };

  const sendOutcomeWithValue = (name: string, value: number) => {
    OneSignal.Session.addOutcomeWithValue(name, value);
    console.log(`Outcome sent: ${name} = ${value}`);
  };

  const addTrigger = (key: string, value: string) => {
    OneSignal.InAppMessages.addTrigger(key, value);
    setTriggersList((prev) => {
      const filtered = prev.filter(([k]) => k !== key);
      return [...filtered, [key, value]];
    });
    console.log(`Trigger added: ${key}`);
  };

  const addTriggers = (pairs: Record<string, string>) => {
    OneSignal.InAppMessages.addTriggers(pairs);
    const newEntries = toPairs(pairs);
    setTriggersList((prev) => {
      const keys = new Set(newEntries.map(([k]) => k));
      return [...prev.filter(([k]) => !keys.has(k)), ...newEntries];
    });
    console.log(`${newEntries.length} trigger(s) added`);
  };

  const removeSelectedTriggers = (keys: string[]) => {
    OneSignal.InAppMessages.removeTriggers(keys);
    const keySet = new Set(keys);
    setTriggersList((prev) => prev.filter(([k]) => !keySet.has(k)));
    console.log(`${keys.length} trigger(s) removed`);
  };

  const clearTriggers = () => {
    OneSignal.InAppMessages.clearTriggers();
    setTriggersList([]);
    console.log('All triggers cleared');
  };

  const trackEvent = (name: string, properties?: Record<string, unknown>) => {
    OneSignal.User.trackEvent(name, properties);
    console.log(`Event tracked: ${name}`);
  };

  const setLocationShared = async (shared: boolean) => {
    setLocationSharedState(shared);
    OneSignal.Location.setShared(shared);
    await preferences.setLocationShared(shared);
    console.log(shared ? 'Location sharing enabled' : 'Location sharing disabled');
  };

  const checkLocationShared = async () => {
    const shared = await OneSignal.Location.isShared();
    console.log(`Location shared: ${shared}`);
    return shared;
  };

  const requestLocationPermission = () => {
    OneSignal.Location.requestPermission();
  };

  const startDefaultLiveActivity = (activityId: string, attributes: object, content: object) => {
    OneSignal.LiveActivities.startDefault(activityId, attributes, content);
    console.log(`Started Live Activity: ${activityId}`);
  };

  const updateLiveActivity = async (activityId: string, eventUpdates: Record<string, unknown>) => {
    const success = await apiService.updateLiveActivity(activityId, 'update', eventUpdates);
    console.log(
      success ? `Updated Live Activity: ${activityId}` : 'Failed to update Live Activity',
    );
  };

  const endLiveActivity = async (activityId: string) => {
    const success = await apiService.updateLiveActivity(activityId, 'end', {
      message: 'Ended Live Activity',
    });
    console.log(success ? `Ended Live Activity: ${activityId}` : 'Failed to end Live Activity');
  };

  return {
    appId,
    consentRequired,
    privacyConsentGiven,
    externalUserId,
    pushSubscriptionId,
    isPushEnabled,
    hasNotificationPermission,
    inAppMessagesPaused,
    locationShared,
    aliasesList,
    emailsList,
    smsNumbersList,
    tagsList,
    triggersList,
    isLoading,
    isReady,
    loginUser,
    logoutUser,
    setConsentRequired,
    setConsentGiven,
    promptPush,
    setPushEnabled,
    sendNotification,
    sendCustomNotification,
    clearAllNotifications,
    setIamPaused,
    sendIamTrigger,
    addAlias,
    addAliases,
    addEmail,
    removeEmail,
    addSms,
    removeSms,
    addTag,
    addTags,
    removeSelectedTags,
    sendOutcome,
    sendUniqueOutcome,
    sendOutcomeWithValue,
    addTrigger,
    addTriggers,
    removeSelectedTriggers,
    clearTriggers,
    trackEvent,
    setLocationShared,
    checkLocationShared,
    requestLocationPermission,
    startDefaultLiveActivity,
    updateLiveActivity,
    endLiveActivity,
  };
}

const OneSignalContext = createContext<UseOneSignalReturn | null>(null);

interface ProviderProps {
  children: ReactNode;
}

export function OneSignalProvider({ children }: ProviderProps) {
  const value = useOneSignalState();
  return createElement(OneSignalContext.Provider, { value }, children);
}

export function useOneSignal(): UseOneSignalReturn {
  const ctx = useContext(OneSignalContext);
  if (!ctx) {
    throw new Error('useOneSignal must be used within <OneSignalProvider>');
  }
  return ctx;
}

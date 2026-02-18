import { useState, useEffect, useCallback } from 'react';
import { OneSignal } from 'react-native-onesignal';
import Toast from 'react-native-toast-message';
import { useAppContext } from '../context/AppContext';
import { NotificationType } from '../models/NotificationType';
import LogManager from '../services/LogManager';
import OneSignalApiService from '../services/OneSignalApiService';

const TAG = 'ViewModel';
const log = LogManager.getInstance();

interface AppState {
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
}

const initialState: AppState = {
  appId: '77e32082-ea27-42e3-a898-c72e141824ef',
  consentRequired: false,
  privacyConsentGiven: false,
  externalUserId: undefined,
  pushSubscriptionId: undefined,
  isPushEnabled: false,
  hasNotificationPermission: false,
  inAppMessagesPaused: false,
  locationShared: false,
  aliasesList: [],
  emailsList: [],
  smsNumbersList: [],
  tagsList: [],
  triggersList: [],
  isLoading: false,
};

export function useAppViewModel() {
  const { repository, preferences } = useAppContext();
  const [state, setState] = useState<AppState>(initialState);

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const fetchUserDataFromApi = useCallback(async () => {
    const onesignalId = await repository.getOnesignalId();
    if (!onesignalId) {
      updateState({ isLoading: false });
      return;
    }
    const userData = await repository.fetchUser(onesignalId);
    if (!userData) {
      updateState({ isLoading: false });
      return;
    }
    const externalId = await repository.getExternalId();
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    updateState({
      aliasesList: Object.entries(userData.aliases),
      tagsList: Object.entries(userData.tags),
      emailsList: userData.emails,
      smsNumbersList: userData.smsNumbers,
      externalUserId: externalId ?? userData.externalId,
      isLoading: false,
    });
  }, [repository, updateState]);

  // Load initial state
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [
        appId,
        consentRequired,
        privacyConsentGiven,
        iamPaused,
        locationShared,
      ] = await Promise.all([
        preferences.getAppId(),
        preferences.getConsentRequired(),
        preferences.getPrivacyConsent(),
        preferences.getIamPaused(),
        preferences.getLocationShared(),
      ]);

      OneSignalApiService.getInstance().setAppId(appId);

      const externalId = await repository.getExternalId();
      const pushId = repository.getPushSubscriptionId();
      const pushOptedIn = repository.isPushOptedIn();
      const hasPerm = repository.hasPermission();

      if (!mounted) {
        return;
      }

      updateState({
        appId,
        consentRequired,
        privacyConsentGiven,
        inAppMessagesPaused: iamPaused,
        locationShared,
        externalUserId: externalId,
        pushSubscriptionId: pushId,
        isPushEnabled: pushOptedIn,
        hasNotificationPermission: hasPerm,
      });

      // Load user data from API if we have an onesignal ID
      const onesignalId = await repository.getOnesignalId();
      if (onesignalId) {
        updateState({ isLoading: true });
        await fetchUserDataFromApi();
      }
    };

    load();
    return () => { mounted = false; };
  }, [repository, preferences, updateState, fetchUserDataFromApi]);

  // SDK event listeners
  useEffect(() => {
    const pushSubHandler = () => {
      updateState({
        pushSubscriptionId: repository.getPushSubscriptionId(),
        isPushEnabled: repository.isPushOptedIn() ?? false,
      });
    };

    const permissionHandler = () => {
      updateState({ hasNotificationPermission: repository.hasPermission() });
    };

    const userChangeHandler = async () => {
      log.i(TAG, 'User changed, fetching user data...');
      updateState({ isLoading: true });
      await fetchUserDataFromApi();
    };

    OneSignal.User.pushSubscription.addEventListener('change', pushSubHandler);
    OneSignal.Notifications.addEventListener('permissionChange', permissionHandler);
    OneSignal.User.addEventListener('change', userChangeHandler);

    return () => {
      OneSignal.User.pushSubscription.removeEventListener('change', pushSubHandler);
      OneSignal.Notifications.removeEventListener('permissionChange', permissionHandler);
      OneSignal.User.removeEventListener('change', userChangeHandler);
    };
  }, [repository, updateState, fetchUserDataFromApi]);

  // Actions
  const loginUser = useCallback(async (externalUserId: string) => {
    updateState({ isLoading: true });
    try {
      repository.loginUser(externalUserId);
      await preferences.setExternalUserId(externalUserId);
      // Clear old user data; loading will hide after user change event fires
      updateState({ aliasesList: [], emailsList: [], smsNumbersList: [], triggersList: [] });
      log.i(TAG, `Logged in as: ${externalUserId}`);
      Toast.show({ type: 'info', text1: `Logged in as: ${externalUserId}` });
    } catch (err) {
      log.e(TAG, `Login error: ${String(err)}`);
      updateState({ isLoading: false });
    }
  }, [repository, preferences, updateState]);

  const logoutUser = useCallback(async () => {
    updateState({ isLoading: true });
    repository.logoutUser();
    await preferences.setExternalUserId(null);
    updateState({
      externalUserId: undefined,
      aliasesList: [],
      emailsList: [],
      smsNumbersList: [],
      triggersList: [],
      tagsList: [],
      isLoading: false,
    });
    log.i(TAG, 'Logged out');
    Toast.show({ type: 'info', text1: 'Logged out' });
  }, [repository, preferences, updateState]);

  const setConsentRequired = useCallback(async (required: boolean) => {
    repository.setConsentRequired(required);
    await preferences.setConsentRequired(required);
    updateState({ consentRequired: required });
  }, [repository, preferences, updateState]);

  const setConsentGiven = useCallback(async (granted: boolean) => {
    repository.setConsentGiven(granted);
    await preferences.setPrivacyConsent(granted);
    updateState({ privacyConsentGiven: granted });
  }, [repository, preferences, updateState]);

  const promptPush = useCallback(async () => {
    const granted = await repository.requestPermission(true);
    updateState({ hasNotificationPermission: granted });
  }, [repository, updateState]);

  const setPushEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      repository.optInPush();
    } else {
      repository.optOutPush();
    }
    updateState({ isPushEnabled: enabled });
    const msg = enabled ? 'Push enabled' : 'Push disabled';
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository, updateState]);

  const sendNotification = useCallback(async (type: NotificationType) => {
    const success = await repository.sendNotification(type);
    const msg = success ? `Notification sent: ${type}` : 'Failed to send notification';
    log.i(TAG, msg);
    Toast.show({ type: success ? 'info' : 'error', text1: msg });
  }, [repository]);

  const sendCustomNotification = useCallback(async (title: string, body: string) => {
    const success = await repository.sendCustomNotification(title, body);
    const msg = success ? `Notification sent: ${title}` : 'Failed to send notification';
    log.i(TAG, msg);
    Toast.show({ type: success ? 'info' : 'error', text1: msg });
  }, [repository]);

  const setIamPaused = useCallback(async (paused: boolean) => {
    repository.setPaused(paused);
    await preferences.setIamPaused(paused);
    updateState({ inAppMessagesPaused: paused });
    const msg = paused ? 'In-app messages paused' : 'In-app messages resumed';
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository, preferences, updateState]);

  const sendIamTrigger = useCallback((iamType: string) => {
    repository.addTrigger('iam_type', iamType);
    const msg = `Sent In-App Message: ${iamType}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const addAlias = useCallback((label: string, id: string) => {
    repository.addAlias(label, id);
    setState(prev => ({
      ...prev,
      aliasesList: [...prev.aliasesList, [label, id]],
    }));
    const msg = `Alias added: ${label}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const addAliases = useCallback((pairs: Record<string, string>) => {
    repository.addAliases(pairs);
    const newEntries = Object.entries(pairs) as [string, string][];
    setState(prev => ({
      ...prev,
      aliasesList: [...prev.aliasesList, ...newEntries],
    }));
    const msg = `${newEntries.length} alias(es) added`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const addEmail = useCallback((email: string) => {
    repository.addEmail(email);
    setState(prev => ({ ...prev, emailsList: [...prev.emailsList, email] }));
    const msg = `Email added: ${email}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const removeEmail = useCallback((email: string) => {
    repository.removeEmail(email);
    setState(prev => ({
      ...prev,
      emailsList: prev.emailsList.filter(e => e !== email),
    }));
    log.i(TAG, `Email removed: ${email}`);
    Toast.show({ type: 'info', text1: `Email removed: ${email}` });
  }, [repository]);

  const addSms = useCallback((sms: string) => {
    repository.addSms(sms);
    setState(prev => ({ ...prev, smsNumbersList: [...prev.smsNumbersList, sms] }));
    const msg = `SMS added: ${sms}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const removeSms = useCallback((sms: string) => {
    repository.removeSms(sms);
    setState(prev => ({
      ...prev,
      smsNumbersList: prev.smsNumbersList.filter(s => s !== sms),
    }));
    log.i(TAG, `SMS removed: ${sms}`);
    Toast.show({ type: 'info', text1: `SMS removed: ${sms}` });
  }, [repository]);

  const addTag = useCallback((key: string, value: string) => {
    repository.addTag(key, value);
    setState(prev => {
      const filtered = prev.tagsList.filter(([k]) => k !== key);
      return { ...prev, tagsList: [...filtered, [key, value]] };
    });
    const msg = `Tag added: ${key}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const addTags = useCallback((pairs: Record<string, string>) => {
    repository.addTags(pairs);
    const newEntries = Object.entries(pairs) as [string, string][];
    setState(prev => {
      const keys = newEntries.map(([k]) => k);
      const filtered = prev.tagsList.filter(([k]) => !keys.includes(k));
      return { ...prev, tagsList: [...filtered, ...newEntries] };
    });
    const msg = `${newEntries.length} tag(s) added`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const removeSelectedTags = useCallback((keys: string[]) => {
    repository.removeTags(keys);
    setState(prev => ({
      ...prev,
      tagsList: prev.tagsList.filter(([k]) => !keys.includes(k)),
    }));
    const msg = `${keys.length} tag(s) removed`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const sendOutcome = useCallback((name: string) => {
    repository.sendOutcome(name);
    log.i(TAG, `Outcome sent: ${name}`);
    Toast.show({ type: 'info', text1: `Outcome sent: ${name}` });
  }, [repository]);

  const sendUniqueOutcome = useCallback((name: string) => {
    repository.sendUniqueOutcome(name);
    log.i(TAG, `Unique outcome sent: ${name}`);
    Toast.show({ type: 'info', text1: `Unique outcome sent: ${name}` });
  }, [repository]);

  const sendOutcomeWithValue = useCallback((name: string, value: number) => {
    repository.sendOutcomeWithValue(name, value);
    log.i(TAG, `Outcome sent: ${name} = ${value}`);
    Toast.show({ type: 'info', text1: `Outcome sent: ${name}` });
  }, [repository]);

  const addTrigger = useCallback((key: string, value: string) => {
    repository.addTrigger(key, value);
    setState(prev => {
      const filtered = prev.triggersList.filter(([k]) => k !== key);
      return { ...prev, triggersList: [...filtered, [key, value]] };
    });
    log.i(TAG, `Trigger added: ${key}`);
    Toast.show({ type: 'info', text1: `Trigger added: ${key}` });
  }, [repository]);

  const addTriggers = useCallback((pairs: Record<string, string>) => {
    repository.addTriggers(pairs);
    const newEntries = Object.entries(pairs) as [string, string][];
    setState(prev => {
      const keys = newEntries.map(([k]) => k);
      const filtered = prev.triggersList.filter(([k]) => !keys.includes(k));
      return { ...prev, triggersList: [...filtered, ...newEntries] };
    });
    const msg = `${newEntries.length} trigger(s) added`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const removeSelectedTriggers = useCallback((keys: string[]) => {
    repository.removeTriggers(keys);
    setState(prev => ({
      ...prev,
      triggersList: prev.triggersList.filter(([k]) => !keys.includes(k)),
    }));
    const msg = `${keys.length} trigger(s) removed`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository]);

  const clearTriggers = useCallback(() => {
    repository.clearTriggers();
    setState(prev => ({ ...prev, triggersList: [] }));
    log.i(TAG, 'All triggers cleared');
    Toast.show({ type: 'info', text1: 'All triggers cleared' });
  }, [repository]);

  const trackEvent = useCallback((name: string, properties?: Record<string, unknown>) => {
    repository.trackEvent(name, properties);
    log.i(TAG, `Event tracked: ${name}`);
    Toast.show({ type: 'info', text1: `Event tracked: ${name}` });
  }, [repository]);

  const setLocationShared = useCallback(async (shared: boolean) => {
    repository.setLocationShared(shared);
    await preferences.setLocationShared(shared);
    updateState({ locationShared: shared });
    const msg = shared ? 'Location sharing enabled' : 'Location sharing disabled';
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, [repository, preferences, updateState]);

  const requestLocationPermission = useCallback(() => {
    repository.requestLocationPermission();
  }, [repository]);

  return {
    state,
    loginUser,
    logoutUser,
    setConsentRequired,
    setConsentGiven,
    promptPush,
    setPushEnabled,
    sendNotification,
    sendCustomNotification,
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
    requestLocationPermission,
  };
}

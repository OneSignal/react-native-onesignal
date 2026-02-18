import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { OneSignal } from 'react-native-onesignal';
import Toast from 'react-native-toast-message';
import OneSignalRepository from '../repositories/OneSignalRepository';
import PreferencesService from '../services/PreferencesService';
import OneSignalApiService from '../services/OneSignalApiService';
import { NotificationType } from '../models/NotificationType';
import LogManager from '../services/LogManager';

const TAG = 'AppContext';
const log = LogManager.getInstance();
const apiService = OneSignalApiService.getInstance();
const repository = new OneSignalRepository(apiService);
const preferences = PreferencesService.getInstance();

export interface AppState {
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

type UserDataPayload = {
  aliasesList: [string, string][];
  tagsList: [string, string][];
  emailsList: string[];
  smsNumbersList: string[];
  externalUserId: string | undefined;
};

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | {
      type: 'SET_INITIAL_STATE';
      payload: {
        appId: string;
        consentRequired: boolean;
        privacyConsentGiven: boolean;
        inAppMessagesPaused: boolean;
        locationShared: boolean;
        externalUserId: string | undefined;
        pushSubscriptionId: string | undefined;
        isPushEnabled: boolean;
        hasNotificationPermission: boolean;
      };
    }
  | { type: 'SET_USER_DATA'; payload: UserDataPayload }
  | { type: 'CLEAR_USER_DATA' }
  | {
      type: 'SET_PUSH_SUBSCRIPTION';
      payload: { id: string | undefined; optedIn: boolean };
    }
  | { type: 'SET_HAS_NOTIFICATION_PERMISSION'; payload: boolean }
  | { type: 'SET_CONSENT_REQUIRED'; payload: boolean }
  | { type: 'SET_PRIVACY_CONSENT_GIVEN'; payload: boolean }
  | { type: 'SET_PUSH_ENABLED'; payload: boolean }
  | { type: 'SET_IAM_PAUSED'; payload: boolean }
  | { type: 'SET_LOCATION_SHARED'; payload: boolean }
  | { type: 'ADD_ALIAS'; payload: { label: string; id: string } }
  | { type: 'ADD_ALIASES'; payload: [string, string][] }
  | { type: 'ADD_EMAIL'; payload: string }
  | { type: 'REMOVE_EMAIL'; payload: string }
  | { type: 'ADD_SMS'; payload: string }
  | { type: 'REMOVE_SMS'; payload: string }
  | { type: 'ADD_TAG'; payload: { key: string; value: string } }
  | { type: 'ADD_TAGS'; payload: [string, string][] }
  | { type: 'REMOVE_SELECTED_TAGS'; payload: string[] }
  | { type: 'ADD_TRIGGER'; payload: { key: string; value: string } }
  | { type: 'ADD_TRIGGERS'; payload: [string, string][] }
  | { type: 'REMOVE_SELECTED_TRIGGERS'; payload: string[] }
  | { type: 'CLEAR_TRIGGERS' }
  | { type: 'LOGOUT' };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_INITIAL_STATE':
      return { ...state, ...action.payload };
    case 'SET_USER_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'CLEAR_USER_DATA':
      return {
        ...state,
        aliasesList: [],
        emailsList: [],
        smsNumbersList: [],
        tagsList: [],
        triggersList: [],
      };
    case 'SET_PUSH_SUBSCRIPTION':
      return {
        ...state,
        pushSubscriptionId: action.payload.id,
        isPushEnabled: action.payload.optedIn,
      };
    case 'SET_HAS_NOTIFICATION_PERMISSION':
      return { ...state, hasNotificationPermission: action.payload };
    case 'SET_CONSENT_REQUIRED':
      return { ...state, consentRequired: action.payload };
    case 'SET_PRIVACY_CONSENT_GIVEN':
      return { ...state, privacyConsentGiven: action.payload };
    case 'SET_PUSH_ENABLED':
      return { ...state, isPushEnabled: action.payload };
    case 'SET_IAM_PAUSED':
      return { ...state, inAppMessagesPaused: action.payload };
    case 'SET_LOCATION_SHARED':
      return { ...state, locationShared: action.payload };
    case 'ADD_ALIAS':
      return {
        ...state,
        aliasesList: [
          ...state.aliasesList,
          [action.payload.label, action.payload.id],
        ],
      };
    case 'ADD_ALIASES':
      return {
        ...state,
        aliasesList: [...state.aliasesList, ...action.payload],
      };
    case 'ADD_EMAIL':
      return { ...state, emailsList: [...state.emailsList, action.payload] };
    case 'REMOVE_EMAIL':
      return {
        ...state,
        emailsList: state.emailsList.filter(email => email !== action.payload),
      };
    case 'ADD_SMS':
      return {
        ...state,
        smsNumbersList: [...state.smsNumbersList, action.payload],
      };
    case 'REMOVE_SMS':
      return {
        ...state,
        smsNumbersList: state.smsNumbersList.filter(
          sms => sms !== action.payload,
        ),
      };
    case 'ADD_TAG': {
      const filtered = state.tagsList.filter(
        ([key]) => key !== action.payload.key,
      );
      return {
        ...state,
        tagsList: [...filtered, [action.payload.key, action.payload.value]],
      };
    }
    case 'ADD_TAGS': {
      const keys = new Set(action.payload.map(([key]) => key));
      return {
        ...state,
        tagsList: [
          ...state.tagsList.filter(([key]) => !keys.has(key)),
          ...action.payload,
        ],
      };
    }
    case 'REMOVE_SELECTED_TAGS': {
      const keys = new Set(action.payload);
      return {
        ...state,
        tagsList: state.tagsList.filter(([key]) => !keys.has(key)),
      };
    }
    case 'ADD_TRIGGER': {
      const filtered = state.triggersList.filter(
        ([key]) => key !== action.payload.key,
      );
      return {
        ...state,
        triggersList: [...filtered, [action.payload.key, action.payload.value]],
      };
    }
    case 'ADD_TRIGGERS': {
      const keys = new Set(action.payload.map(([key]) => key));
      return {
        ...state,
        triggersList: [
          ...state.triggersList.filter(([key]) => !keys.has(key)),
          ...action.payload,
        ],
      };
    }
    case 'REMOVE_SELECTED_TRIGGERS': {
      const keys = new Set(action.payload);
      return {
        ...state,
        triggersList: state.triggersList.filter(([key]) => !keys.has(key)),
      };
    }
    case 'CLEAR_TRIGGERS':
      return { ...state, triggersList: [] };
    case 'LOGOUT':
      return {
        ...state,
        externalUserId: undefined,
        aliasesList: [],
        emailsList: [],
        smsNumbersList: [],
        tagsList: [],
        triggersList: [],
        isLoading: false,
      };
    default:
      return state;
  }
}

type AppContextValue = {
  state: AppState;
  loginUser: (externalUserId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  setConsentRequired: (required: boolean) => Promise<void>;
  setConsentGiven: (granted: boolean) => Promise<void>;
  promptPush: () => Promise<void>;
  setPushEnabled: (enabled: boolean) => void;
  sendNotification: (type: NotificationType) => Promise<void>;
  sendCustomNotification: (title: string, body: string) => Promise<void>;
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
  requestLocationPermission: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

interface Props {
  children: React.ReactNode;
}

function toPairs(pairs: Record<string, string>): [string, string][] {
  return Object.entries(pairs).map(([key, value]) => [key, value]);
}

export function AppContextProvider({ children }: Props) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const mountedRef = useRef(true);
  const requestSequenceRef = useRef(0);

  const fetchUserDataFromApi = useCallback(async () => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;

    const onesignalId = await repository.getOnesignalId();
    if (!onesignalId) {
      if (mountedRef.current && requestSequenceRef.current === requestId) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      return;
    }

    const userData = await repository.fetchUser(onesignalId);
    if (!userData) {
      if (mountedRef.current && requestSequenceRef.current === requestId) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      return;
    }

    const externalId = await repository.getExternalId();
    if (!mountedRef.current || requestSequenceRef.current !== requestId) {
      return;
    }

    dispatch({
      type: 'SET_USER_DATA',
      payload: {
        aliasesList: Object.entries(userData.aliases),
        tagsList: Object.entries(userData.tags),
        emailsList: userData.emails,
        smsNumbersList: userData.smsNumbers,
        externalUserId: externalId ?? userData.externalId,
      },
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
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
      const [pushId, pushOptedIn] = await Promise.all([
        repository.getPushSubscriptionIdAsync(),
        repository.isPushOptedInAsync(),
      ]);
      const hasPerm = repository.hasPermission();

      if (!mountedRef.current) {
        return;
      }

      dispatch({
        type: 'SET_INITIAL_STATE',
        payload: {
          appId,
          consentRequired,
          privacyConsentGiven,
          inAppMessagesPaused: iamPaused,
          locationShared,
          externalUserId: externalId,
          pushSubscriptionId: pushId,
          isPushEnabled: pushOptedIn,
          hasNotificationPermission: hasPerm,
        },
      });

      const onesignalId = await repository.getOnesignalId();
      if (!mountedRef.current) {
        return;
      }

      if (onesignalId) {
        dispatch({ type: 'SET_LOADING', payload: true });
        await fetchUserDataFromApi();
      }
    };

    load().catch(err => {
      log.e(TAG, `Initial load error: ${String(err)}`);
      if (mountedRef.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });
  }, [fetchUserDataFromApi]);

  useEffect(() => {
    const pushSubHandler = async () => {
      if (!mountedRef.current) {
        return;
      }
      const [id, optedIn] = await Promise.all([
        repository.getPushSubscriptionIdAsync(),
        repository.isPushOptedInAsync(),
      ]);
      if (!mountedRef.current) {
        return;
      }
      dispatch({
        type: 'SET_PUSH_SUBSCRIPTION',
        payload: {
          id,
          optedIn,
        },
      });
    };

    const permissionHandler = () => {
      if (!mountedRef.current) {
        return;
      }
      dispatch({
        type: 'SET_HAS_NOTIFICATION_PERMISSION',
        payload: repository.hasPermission(),
      });
    };

    const userChangeHandler = async () => {
      log.i(TAG, 'User changed, fetching user data...');
      if (!mountedRef.current) {
        return;
      }
      dispatch({ type: 'SET_LOADING', payload: true });
      await fetchUserDataFromApi();
    };

    OneSignal.User.pushSubscription.addEventListener('change', pushSubHandler);
    OneSignal.Notifications.addEventListener(
      'permissionChange',
      permissionHandler,
    );
    OneSignal.User.addEventListener('change', userChangeHandler);

    return () => {
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        pushSubHandler,
      );
      OneSignal.Notifications.removeEventListener(
        'permissionChange',
        permissionHandler,
      );
      OneSignal.User.removeEventListener('change', userChangeHandler);
    };
  }, [fetchUserDataFromApi]);

  const loginUser = useCallback(async (externalUserId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      repository.loginUser(externalUserId);
      await preferences.setExternalUserId(externalUserId);
      if (mountedRef.current) {
        dispatch({ type: 'CLEAR_USER_DATA' });
      }
      log.i(TAG, `Logged in as: ${externalUserId}`);
      Toast.show({ type: 'info', text1: `Logged in as: ${externalUserId}` });
    } catch (err) {
      log.e(TAG, `Login error: ${String(err)}`);
      if (mountedRef.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, []);

  const logoutUser = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    repository.logoutUser();
    await preferences.setExternalUserId(null);
    if (mountedRef.current) {
      dispatch({ type: 'LOGOUT' });
    }
    log.i(TAG, 'Logged out');
    Toast.show({ type: 'info', text1: 'Logged out' });
  }, []);

  const setConsentRequired = useCallback(async (required: boolean) => {
    if (mountedRef.current) {
      dispatch({ type: 'SET_CONSENT_REQUIRED', payload: required });
    }
    repository.setConsentRequired(required);
    await preferences.setConsentRequired(required);
  }, []);

  const setConsentGiven = useCallback(async (granted: boolean) => {
    if (mountedRef.current) {
      dispatch({ type: 'SET_PRIVACY_CONSENT_GIVEN', payload: granted });
    }
    repository.setConsentGiven(granted);
    await preferences.setPrivacyConsent(granted);
  }, []);

  const promptPush = useCallback(async () => {
    const granted = await repository.requestPermission(true);
    if (mountedRef.current) {
      dispatch({ type: 'SET_HAS_NOTIFICATION_PERMISSION', payload: granted });
    }
  }, []);

  const setPushEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      repository.optInPush();
    } else {
      repository.optOutPush();
    }
    dispatch({ type: 'SET_PUSH_ENABLED', payload: enabled });
    const msg = enabled ? 'Push enabled' : 'Push disabled';
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const sendNotification = useCallback(async (type: NotificationType) => {
    const success = await repository.sendNotification(type);
    const msg = success
      ? `Notification sent: ${type}`
      : 'Failed to send notification';
    log.i(TAG, msg);
    Toast.show({ type: success ? 'info' : 'error', text1: msg });
  }, []);

  const sendCustomNotification = useCallback(
    async (title: string, body: string) => {
      const success = await repository.sendCustomNotification(title, body);
      const msg = success
        ? `Notification sent: ${title}`
        : 'Failed to send notification';
      log.i(TAG, msg);
      Toast.show({ type: success ? 'info' : 'error', text1: msg });
    },
    [],
  );

  const setIamPaused = useCallback(async (paused: boolean) => {
    dispatch({ type: 'SET_IAM_PAUSED', payload: paused });
    repository.setPaused(paused);
    await preferences.setIamPaused(paused);
    const msg = paused ? 'In-app messages paused' : 'In-app messages resumed';
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const sendIamTrigger = useCallback((iamType: string) => {
    repository.addTrigger('iam_type', iamType);
    dispatch({
      type: 'ADD_TRIGGER',
      payload: { key: 'iam_type', value: iamType },
    });
    const msg = `Sent In-App Message: ${iamType}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const addAlias = useCallback((label: string, id: string) => {
    repository.addAlias(label, id);
    dispatch({ type: 'ADD_ALIAS', payload: { label, id } });
    const msg = `Alias added: ${label}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const addAliases = useCallback((pairs: Record<string, string>) => {
    repository.addAliases(pairs);
    const newEntries = toPairs(pairs);
    dispatch({ type: 'ADD_ALIASES', payload: newEntries });
    const msg = `${newEntries.length} alias(es) added`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const addEmail = useCallback((email: string) => {
    repository.addEmail(email);
    dispatch({ type: 'ADD_EMAIL', payload: email });
    const msg = `Email added: ${email}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const removeEmail = useCallback((email: string) => {
    repository.removeEmail(email);
    dispatch({ type: 'REMOVE_EMAIL', payload: email });
    log.i(TAG, `Email removed: ${email}`);
    Toast.show({ type: 'info', text1: `Email removed: ${email}` });
  }, []);

  const addSms = useCallback((sms: string) => {
    repository.addSms(sms);
    dispatch({ type: 'ADD_SMS', payload: sms });
    const msg = `SMS added: ${sms}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const removeSms = useCallback((sms: string) => {
    repository.removeSms(sms);
    dispatch({ type: 'REMOVE_SMS', payload: sms });
    log.i(TAG, `SMS removed: ${sms}`);
    Toast.show({ type: 'info', text1: `SMS removed: ${sms}` });
  }, []);

  const addTag = useCallback((key: string, value: string) => {
    repository.addTag(key, value);
    dispatch({ type: 'ADD_TAG', payload: { key, value } });
    const msg = `Tag added: ${key}`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const addTags = useCallback((pairs: Record<string, string>) => {
    repository.addTags(pairs);
    const newEntries = toPairs(pairs);
    dispatch({ type: 'ADD_TAGS', payload: newEntries });
    const msg = `${newEntries.length} tag(s) added`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const removeSelectedTags = useCallback((keys: string[]) => {
    repository.removeTags(keys);
    dispatch({ type: 'REMOVE_SELECTED_TAGS', payload: keys });
    const msg = `${keys.length} tag(s) removed`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const sendOutcome = useCallback((name: string) => {
    repository.sendOutcome(name);
    log.i(TAG, `Outcome sent: ${name}`);
    Toast.show({ type: 'info', text1: `Outcome sent: ${name}` });
  }, []);

  const sendUniqueOutcome = useCallback((name: string) => {
    repository.sendUniqueOutcome(name);
    log.i(TAG, `Unique outcome sent: ${name}`);
    Toast.show({ type: 'info', text1: `Unique outcome sent: ${name}` });
  }, []);

  const sendOutcomeWithValue = useCallback((name: string, value: number) => {
    repository.sendOutcomeWithValue(name, value);
    log.i(TAG, `Outcome sent: ${name} = ${value}`);
    Toast.show({ type: 'info', text1: `Outcome sent: ${name}` });
  }, []);

  const addTrigger = useCallback((key: string, value: string) => {
    repository.addTrigger(key, value);
    dispatch({ type: 'ADD_TRIGGER', payload: { key, value } });
    log.i(TAG, `Trigger added: ${key}`);
    Toast.show({ type: 'info', text1: `Trigger added: ${key}` });
  }, []);

  const addTriggers = useCallback((pairs: Record<string, string>) => {
    repository.addTriggers(pairs);
    const newEntries = toPairs(pairs);
    dispatch({ type: 'ADD_TRIGGERS', payload: newEntries });
    const msg = `${newEntries.length} trigger(s) added`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const removeSelectedTriggers = useCallback((keys: string[]) => {
    repository.removeTriggers(keys);
    dispatch({ type: 'REMOVE_SELECTED_TRIGGERS', payload: keys });
    const msg = `${keys.length} trigger(s) removed`;
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const clearTriggers = useCallback(() => {
    repository.clearTriggers();
    dispatch({ type: 'CLEAR_TRIGGERS' });
    log.i(TAG, 'All triggers cleared');
    Toast.show({ type: 'info', text1: 'All triggers cleared' });
  }, []);

  const trackEvent = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      repository.trackEvent(name, properties);
      log.i(TAG, `Event tracked: ${name}`);
      Toast.show({ type: 'info', text1: `Event tracked: ${name}` });
    },
    [],
  );

  const setLocationShared = useCallback(async (shared: boolean) => {
    dispatch({ type: 'SET_LOCATION_SHARED', payload: shared });
    repository.setLocationShared(shared);
    await preferences.setLocationShared(shared);
    const msg = shared
      ? 'Location sharing enabled'
      : 'Location sharing disabled';
    log.i(TAG, msg);
    Toast.show({ type: 'info', text1: msg });
  }, []);

  const requestLocationPermission = useCallback(() => {
    repository.requestLocationPermission();
  }, []);

  const contextValue = useMemo<AppContextValue>(
    () => ({
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
    }),
    [
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
    ],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return ctx;
}

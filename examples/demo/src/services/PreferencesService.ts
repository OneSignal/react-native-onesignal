import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  APP_ID: 'onesignal_app_id',
  CONSENT_REQUIRED: 'onesignal_consent_required',
  PRIVACY_CONSENT: 'onesignal_privacy_consent',
  EXTERNAL_USER_ID: 'onesignal_external_user_id',
  LOCATION_SHARED: 'onesignal_location_shared',
  IAM_PAUSED: 'onesignal_iam_paused',
} as const;

class PreferencesService {
  private static _instance: PreferencesService;

  static getInstance(): PreferencesService {
    if (!PreferencesService._instance) {
      PreferencesService._instance = new PreferencesService();
    }
    return PreferencesService._instance;
  }

  async getAppId(): Promise<string> {
    const value = await AsyncStorage.getItem(KEYS.APP_ID);
    return value ?? '77e32082-ea27-42e3-a898-c72e141824ef';
  }

  async setAppId(appId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.APP_ID, appId);
  }

  async getConsentRequired(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.CONSENT_REQUIRED);
    return value === 'true';
  }

  async setConsentRequired(required: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.CONSENT_REQUIRED, String(required));
  }

  async getPrivacyConsent(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.PRIVACY_CONSENT);
    return value === 'true';
  }

  async setPrivacyConsent(granted: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.PRIVACY_CONSENT, String(granted));
  }

  async getExternalUserId(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.EXTERNAL_USER_ID);
  }

  async setExternalUserId(userId: string | null): Promise<void> {
    if (userId === null) {
      await AsyncStorage.removeItem(KEYS.EXTERNAL_USER_ID);
    } else {
      await AsyncStorage.setItem(KEYS.EXTERNAL_USER_ID, userId);
    }
  }

  async getLocationShared(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.LOCATION_SHARED);
    return value === 'true';
  }

  async setLocationShared(shared: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.LOCATION_SHARED, String(shared));
  }

  async getIamPaused(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.IAM_PAUSED);
    return value === 'true';
  }

  async setIamPaused(paused: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.IAM_PAUSED, String(paused));
  }
}

export default PreferencesService;

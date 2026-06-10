import { ONESIGNAL_APP_ID as ENV_ONESIGNAL_APP_ID } from '@env';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OneSignal } from 'react-native-onesignal';

const ONESIGNAL_APP_ID = ENV_ONESIGNAL_APP_ID?.trim() || 'YOUR-ONESIGNAL-APP-ID';
const ANDROID_STATUS_BAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;

const isPlaceholder = (value: string) => value.toLowerCase().startsWith('your-');

export default function App() {
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean | null>(null);
  const [pushSubscriptionId, setPushSubscriptionId] = useState<string | null>(null);
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [sending, setSending] = useState(false);

  const refreshPushState = useCallback(() => {
    void OneSignal.Notifications.getPermissionAsync()
      .then(setHasNotificationPermission)
      .catch(() => {
        setHasNotificationPermission(null);
      });

    void OneSignal.User.pushSubscription
      .getIdAsync()
      .then(setPushSubscriptionId)
      .catch(() => {
        setPushSubscriptionId(null);
      });
  }, []);

  useEffect(() => {
    OneSignal.initialize(ONESIGNAL_APP_ID);
    refreshPushState();
  }, [refreshPushState]);

  const requestNotificationPermission = useCallback(async () => {
    setRequestingPermission(true);
    try {
      const granted = await OneSignal.Notifications.requestPermission(false);
      setHasNotificationPermission(granted);
      refreshPushState();
    } catch (error) {
      Alert.alert('Permission Request Failed', String(error));
    } finally {
      setRequestingPermission(false);
    }
  }, [refreshPushState]);

  const testLocationPermissionRequest = useCallback(() => {
    try {
      OneSignal.Location.requestPermission();
    } catch (error) {
      console.error('OneSignal.Location.requestPermission failed:', error);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    if (isPlaceholder(ONESIGNAL_APP_ID)) {
      Alert.alert(
        'Configure OneSignal',
        'Set ONESIGNAL_APP_ID in .env before sending a test push.',
      );
      return;
    }

    if (!hasNotificationPermission) {
      Alert.alert(
        'Notifications Disabled',
        'Request notification permission before sending a test push.',
      );
      return;
    }

    if (!pushSubscriptionId) {
      Alert.alert('No Push Subscription', 'Allow notifications, then wait for a push ID.');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.onesignal.v1+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: ONESIGNAL_APP_ID,
          include_subscription_ids: [pushSubscriptionId],
          headings: { en: 'OneSignal No-Location Demo' },
          contents: { en: 'This test push was sent without linking the location module.' },
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        Alert.alert('Send Failed', message);
        return;
      }
    } catch (error) {
      Alert.alert('Send Failed', String(error));
    } finally {
      setSending(false);
    }
  }, [hasNotificationPermission, pushSubscriptionId]);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#E54B4D" barStyle="light-content" />
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>OneSignal</Text>
          <Text style={styles.headerSubtitle}>No-Location Demo</Text>
        </View>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>App ID</Text>
              <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                {ONESIGNAL_APP_ID}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Permission</Text>
              <Text style={styles.value}>
                {hasNotificationPermission == null
                  ? 'Unknown'
                  : hasNotificationPermission
                    ? 'Granted'
                    : 'Not granted'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Push ID</Text>
              <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
                {pushSubscriptionId ?? '-'}
              </Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={[styles.button, requestingPermission && styles.buttonDisabled]}
              onPress={requestNotificationPermission}
              disabled={requestingPermission}
              activeOpacity={0.8}
            >
              {requestingPermission ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>REQUEST PERMISSION</Text>
              )}
            </TouchableOpacity>
            <View style={styles.buttonSpacer} />
            <TouchableOpacity
              style={[styles.button, sending && styles.buttonDisabled]}
              onPress={sendTestNotification}
              disabled={sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>SEND TEST NOTIFICATION</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Module</Text>
          <View style={styles.card}>
            <Text style={styles.body}>
              This demo initializes OneSignal and requests notification permission only when you tap
              the button above. Native build flags exclude the location module. The location test
              call may not log a JavaScript error; check Android Logcat or Xcode logs for native
              diagnostics.
            </Text>
            <View style={styles.locationButtonWrap}>
              <TouchableOpacity
                style={styles.outlinedButton}
                onPress={testLocationPermissionRequest}
                activeOpacity={0.8}
              >
                <Text style={styles.outlinedButtonText}>TEST LOCATION REQUEST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerSafeArea: {
    backgroundColor: '#E54B4D',
    paddingTop: ANDROID_STATUS_BAR_HEIGHT,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E54B4D',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    paddingVertical: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#616161',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#757575',
    fontSize: 14,
    minWidth: 60,
  },
  value: {
    color: '#616161',
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'right',
  },
  divider: {
    backgroundColor: '#E8EAED',
    height: 1,
    marginVertical: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#E54B4D',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSpacer: {
    height: 8,
  },
  locationButtonWrap: {
    marginTop: 12,
  },
  outlinedButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: '#E54B4D',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  outlinedButtonText: {
    color: '#E54B4D',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    color: '#616161',
    fontSize: 16,
  },
});

import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  LogLevel,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
  OneSignal,
} from 'react-native-onesignal';
import { SafeAreaView } from 'react-native-safe-area-context';
import OSConsole from './OSConsole';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { Colors } from './constants/Colors';
import { APP_ID } from './constants/Config';
import { fetchUserData } from './services/OneSignalService';
import { AppInfoSection } from './components/sections/AppInfoSection';
import { PushSubscriptionSection } from './components/sections/PushSubscriptionSection';
import { NotificationDemoSection } from './components/sections/NotificationDemoSection';
import { InAppMessagingSection } from './components/sections/InAppMessagingSection';
import { IamDemoSection } from './components/sections/IamDemoSection';
import { AliasesSection } from './components/sections/AliasesSection';
import { EmailSection } from './components/sections/EmailSection';
import { SmsSection } from './components/sections/SmsSection';
import { TagsSection } from './components/sections/TagsSection';
import { OutcomeSection } from './components/sections/OutcomeSection';
import { TriggersSection } from './components/sections/TriggersSection';
import { TrackEventSection } from './components/sections/TrackEventSection';
import { LocationSection } from './components/sections/LocationSection';
import { LiveActivitiesSection } from './components/sections/LiveActivitiesSection';
import { NavigationSection } from './components/sections/NavigationSection';

/**
 * Inner component that uses the app state context
 */
function OSDemoContent() {
  const { state, dispatch } = useAppState();
  const [consoleValue, setConsoleValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const OSLog = useCallback((message: string, optionalArg: unknown = null) => {
    let logMessage = message;
    if (optionalArg !== null) {
      logMessage = message + JSON.stringify(optionalArg);
    }

    console.log(logMessage);

    setConsoleValue((prevValue) => {
      if (prevValue) {
        return `${prevValue}\n${logMessage}`;
      }
      return logMessage;
    });
  }, []);

  /**
   * Fetches user data from REST API and updates state
   */
  const fetchAndPopulateUserData = useCallback(async () => {
    try {
      const onesignalId = OneSignal.User.onesignalId;
      if (!onesignalId) {
        OSLog('No OneSignal ID found, skipping data fetch');
        return;
      }

      OSLog('Fetching user data from API...');
      dispatch({ type: 'SET_LOADING', payload: true });

      const userData = await fetchUserData(onesignalId);

      // Populate state with fetched data
      dispatch({ type: 'SET_ALL_ALIASES', payload: userData.aliases });
      dispatch({ type: 'SET_ALL_TAGS', payload: userData.tags });
      dispatch({ type: 'SET_ALL_EMAILS', payload: userData.emails });
      dispatch({ type: 'SET_ALL_SMS', payload: userData.smsNumbers });

      if (userData.externalId) {
        dispatch({ type: 'SET_EXTERNAL_USER_ID', payload: userData.externalId });
      }

      OSLog('User data loaded successfully');

      // Add 100ms delay to ensure UI has time to render
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      OSLog('Failed to fetch user data: ', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, OSLog]);

  const onForegroundWillDisplay = useCallback(
    (event: NotificationWillDisplayEvent) => {
      const notif = event.getNotification();
      OSLog('OneSignal: notification will show in foreground:', notif.title);
      console.log('Will display notification event:', notif);

      event.preventDefault();

      setTimeout(() => {
        notif.display();
      }, 5000);
    },
    [OSLog],
  );

  const onNotificationClick = useCallback(
    (event: NotificationClickEvent) => {
      const notif = event.notification;
      OSLog('OneSignal: notification clicked:', notif.title);
      console.log('Notification clicked event:', notif);
    },
    [OSLog],
  );

  const onIAMClick = useCallback(
    (event: unknown) => {
      OSLog('OneSignal IAM clicked:', event);
    },
    [OSLog],
  );

  const onIAMWillDisplay = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: will display IAM: ', event);
    },
    [OSLog],
  );

  const onIAMDidDisplay = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: did display IAM: ', event);
    },
    [OSLog],
  );

  const onIAMWillDismiss = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: will dismiss IAM: ', event);
    },
    [OSLog],
  );

  const onIAMDidDismiss = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: did dismiss IAM: ', event);
    },
    [OSLog],
  );

  const onSubscriptionChange = useCallback(
    (subscription: unknown) => {
      OSLog('OneSignal: subscription changed:', subscription);
    },
    [OSLog],
  );

  const onPermissionChange = useCallback(
    (granted: boolean) => {
      OSLog('OneSignal: permission changed:', granted);
      dispatch({ type: 'SET_PERMISSION_GRANTED', payload: granted });
    },
    [OSLog, dispatch],
  );

  const onUserChange = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: user changed: ', event);
      // Fetch user data when user changes
      fetchAndPopulateUserData();
    },
    [OSLog, fetchAndPopulateUserData],
  );

  useEffect(() => {
    OneSignal.initialize(APP_ID);
    OneSignal.Debug.setLogLevel(LogLevel.None);

    // Fetch user data on cold start if OneSignal ID exists
    const initUserData = async () => {
      const onesignalId = OneSignal.User.onesignalId;
      if (onesignalId) {
        fetchAndPopulateUserData();
      }
    };
    initUserData();
  }, [fetchAndPopulateUserData]);

  useFocusEffect(
    useCallback(() => {
      console.log('Setting up event listeners');

      const setup = async () => {
        OneSignal.LiveActivities.setupDefault();
        OneSignal.Notifications.addEventListener(
          'foregroundWillDisplay',
          onForegroundWillDisplay,
        );
        OneSignal.Notifications.addEventListener('click', onNotificationClick);
        OneSignal.InAppMessages.addEventListener('click', onIAMClick);
        OneSignal.InAppMessages.addEventListener(
          'willDisplay',
          onIAMWillDisplay,
        );
        OneSignal.InAppMessages.addEventListener('didDisplay', onIAMDidDisplay);
        OneSignal.InAppMessages.addEventListener(
          'willDismiss',
          onIAMWillDismiss,
        );
        OneSignal.InAppMessages.addEventListener('didDismiss', onIAMDidDismiss);
        OneSignal.User.pushSubscription.addEventListener(
          'change',
          onSubscriptionChange,
        );
        OneSignal.Notifications.addEventListener(
          'permissionChange',
          onPermissionChange,
        );
        OneSignal.User.addEventListener('change', onUserChange);
      };

      setup();

      return () => {
        console.log('Cleaning up event listeners');

        // Clean up all event listeners
        OneSignal.Notifications.removeEventListener(
          'foregroundWillDisplay',
          onForegroundWillDisplay,
        );
        OneSignal.Notifications.removeEventListener(
          'click',
          onNotificationClick,
        );
        OneSignal.InAppMessages.removeEventListener('click', onIAMClick);
        OneSignal.InAppMessages.removeEventListener(
          'willDisplay',
          onIAMWillDisplay,
        );
        OneSignal.InAppMessages.removeEventListener(
          'didDisplay',
          onIAMDidDisplay,
        );
        OneSignal.InAppMessages.removeEventListener(
          'willDismiss',
          onIAMWillDismiss,
        );
        OneSignal.InAppMessages.removeEventListener(
          'didDismiss',
          onIAMDidDismiss,
        );
        OneSignal.User.pushSubscription.removeEventListener(
          'change',
          onSubscriptionChange,
        );
        OneSignal.Notifications.removeEventListener(
          'permissionChange',
          onPermissionChange,
        );
        OneSignal.User.removeEventListener('change', onUserChange);
      };
    }, [
      onForegroundWillDisplay,
      onNotificationClick,
      onIAMClick,
      onIAMWillDisplay,
      onIAMDidDisplay,
      onIAMWillDismiss,
      onIAMDidDismiss,
      onSubscriptionChange,
      onPermissionChange,
      onUserChange,
    ]),
  );

  const inputChange = useCallback((text: string) => {
    setInputValue(text);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>OneSignal</Text>
        <OSConsole value={consoleValue} />
        <View style={styles.clearButton}>
          <TouchableOpacity
            style={styles.clearButtonTouchable}
            onPress={() => {
              setConsoleValue('');
            }}
          >
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Input"
          onChangeText={inputChange}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        {/* Section Order matching Android V2 */}
        <AppInfoSection loggingFunction={OSLog} />
        <PushSubscriptionSection loggingFunction={OSLog} />
        <NotificationDemoSection loggingFunction={OSLog} />
        <InAppMessagingSection loggingFunction={OSLog} />
        <IamDemoSection loggingFunction={OSLog} />
        <AliasesSection loggingFunction={OSLog} />
        <EmailSection loggingFunction={OSLog} />
        <SmsSection loggingFunction={OSLog} />
        <TagsSection loggingFunction={OSLog} />
        <OutcomeSection loggingFunction={OSLog} />
        <TriggersSection loggingFunction={OSLog} />
        <TrackEventSection loggingFunction={OSLog} />
        <LocationSection loggingFunction={OSLog} />
        <LiveActivitiesSection loggingFunction={OSLog} inputValue={inputValue} />
        <NavigationSection />
      </ScrollView>

      {/* Loading Overlay */}
      {state.isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * Main OSDemo component wrapped with AppStateProvider
 */
const OSDemo: React.FC = () => {
  return (
    <AppStateProvider>
      <OSDemoContent />
    </AppStateProvider>
  );
};

// styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: '#fff',
  },
  header: {
    flex: 0.3,
  },
  scrollView: {
    flex: 0.7,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 40,
    alignSelf: 'center',
    paddingTop: 4,
    paddingBottom: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 70,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonTouchable: {
    width: 44,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    marginTop: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default OSDemo;

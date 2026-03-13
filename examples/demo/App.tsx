import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import {
  InAppMessageClickEvent,
  InAppMessageDidDismissEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageWillDisplayEvent,
  LogLevel,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
  OneSignal,
} from 'react-native-onesignal';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import OneSignalLogo from './assets/onesignal_logo.svg';
import { AppContextProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import SecondaryScreen from './src/screens/SecondaryScreen';
import LogManager from './src/services/LogManager';
import OneSignalApiService from './src/services/OneSignalApiService';
import PreferencesService from './src/services/PreferencesService';
import TooltipHelper from './src/services/TooltipHelper';
import { AppColors } from './src/theme';

const Stack = createNativeStackNavigator();
const log = LogManager.getInstance();
const TAG = 'App';

function App() {
  useEffect(() => {
    const handleIamWillDisplay = (e: InAppMessageWillDisplayEvent) => {
      log.i(TAG, `IAM willDisplay: ${e.message.messageId}`);
    };

    const handleIamDidDisplay = (e: InAppMessageDidDisplayEvent) => {
      log.i(TAG, `IAM didDisplay: ${e.message.messageId}`);
    };

    const handleIamWillDismiss = (e: InAppMessageWillDismissEvent) => {
      log.i(TAG, `IAM willDismiss: ${e.message.messageId}`);
    };

    const handleIamDidDismiss = (e: InAppMessageDidDismissEvent) => {
      log.i(TAG, `IAM didDismiss: ${e.message.messageId}`);
    };

    const handleIamClick = (e: InAppMessageClickEvent) => {
      log.i(TAG, `IAM click: ${e.result.actionId ?? 'unknown'}`);
    };

    const handleNotificationClick = (e: NotificationClickEvent) => {
      log.i(TAG, `Notification click: ${e.notification.title ?? ''}`);
    };

    const handlePermissionChange = (granted: boolean) => {
      log.i(TAG, `Permission changed: ${granted}`);
    };

    const handleForegroundWillDisplay = (e: NotificationWillDisplayEvent) => {
      log.i(
        TAG,
        `Notification foregroundWillDisplay: ${
          e.getNotification().title ?? ''
        }`,
      );
      e.getNotification().display();
    };

    const init = async () => {
      try {
        const prefs = PreferencesService.getInstance();
        const [
          appId,
          consentRequired,
          privacyConsent,
          iamPaused,
          locationShared,
        ] = await Promise.all([
          prefs.getAppId(),
          prefs.getConsentRequired(),
          prefs.getPrivacyConsent(),
          prefs.getIamPaused(),
          prefs.getLocationShared(),
        ]);

        OneSignalApiService.getInstance().setAppId(appId);

        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        OneSignal.setConsentRequired(consentRequired);
        OneSignal.setConsentGiven(privacyConsent);
        OneSignal.initialize(appId);

        OneSignal.InAppMessages.setPaused(iamPaused);
        OneSignal.Location.setShared(locationShared);

        // Register SDK event listeners for logging
        OneSignal.InAppMessages.addEventListener(
          'willDisplay',
          handleIamWillDisplay,
        );
        OneSignal.InAppMessages.addEventListener(
          'didDisplay',
          handleIamDidDisplay,
        );
        OneSignal.InAppMessages.addEventListener(
          'willDismiss',
          handleIamWillDismiss,
        );
        OneSignal.InAppMessages.addEventListener(
          'didDismiss',
          handleIamDidDismiss,
        );
        OneSignal.InAppMessages.addEventListener('click', handleIamClick);
        OneSignal.Notifications.addEventListener(
          'click',
          handleNotificationClick,
        );
        OneSignal.Notifications.addEventListener(
          'permissionChange',
          handlePermissionChange,
        );
        OneSignal.Notifications.addEventListener(
          'foregroundWillDisplay',
          handleForegroundWillDisplay,
        );

        log.i(TAG, `OneSignal initialized with app ID: ${appId}`);
      } catch (err) {
        log.e(TAG, `Init error: ${String(err)}`);
      }
    };

    void init();

    // Fetch tooltips in background
    void TooltipHelper.getInstance().init();

    return () => {
      OneSignal.InAppMessages.removeEventListener(
        'willDisplay',
        handleIamWillDisplay,
      );
      OneSignal.InAppMessages.removeEventListener(
        'didDisplay',
        handleIamDidDisplay,
      );
      OneSignal.InAppMessages.removeEventListener(
        'willDismiss',
        handleIamWillDismiss,
      );
      OneSignal.InAppMessages.removeEventListener(
        'didDismiss',
        handleIamDidDismiss,
      );
      OneSignal.InAppMessages.removeEventListener('click', handleIamClick);
      OneSignal.Notifications.removeEventListener(
        'click',
        handleNotificationClick,
      );
      OneSignal.Notifications.removeEventListener(
        'permissionChange',
        handlePermissionChange,
      );
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={AppColors.osPrimary}
        barStyle="light-content"
      />
      <AppContextProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: AppColors.osPrimary },
              headerTintColor: AppColors.white,
              headerTitleAlign: 'center',
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerTitle: () => (
                  <View style={headerStyles.container}>
                    <OneSignalLogo
                      height={22}
                      width={99}
                      style={headerStyles.logo}
                    />
                    <Text style={headerStyles.subtitle}>React Native</Text>
                  </View>
                ),
              }}
            />
            <Stack.Screen
              name="Secondary"
              component={SecondaryScreen}
              options={{ title: 'Secondary Activity' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContextProvider>
      <Toast position="bottom" bottomOffset={20} />
    </SafeAreaProvider>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    marginRight: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: AppColors.white,
  },
});

export default App;

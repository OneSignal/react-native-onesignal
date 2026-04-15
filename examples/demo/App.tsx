import { ONESIGNAL_APP_ID } from '@env';
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
import OneSignalApiService from './src/services/OneSignalApiService';
import PreferencesService from './src/services/PreferencesService';
import TooltipHelper from './src/services/TooltipHelper';
import { AppColors } from './src/theme';

const DEFAULT_APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

function getAppId(): string {
  return ONESIGNAL_APP_ID?.trim() || DEFAULT_APP_ID;
}

const Stack = createNativeStackNavigator();

function App() {
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

    const handlePermissionChange = (granted: boolean) => {
      console.log(`Permission changed: ${granted}`);
    };

    const handleForegroundWillDisplay = (e: NotificationWillDisplayEvent) => {
      console.log(`Notification foregroundWillDisplay: ${e.getNotification().title ?? ''}`);
      e.getNotification().display();
    };

    const init = async () => {
      try {
        const prefs = PreferencesService.getInstance();
        const appId = getAppId();
        const [consentRequired, privacyConsent, iamPaused, locationShared] = await Promise.all([
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

        OneSignal.LiveActivities.setupDefault({
          enablePushToStart: true,
          enablePushToUpdate: true,
        });

        OneSignal.InAppMessages.setPaused(iamPaused);
        OneSignal.Location.setShared(locationShared);

        // Register SDK event listeners for logging
        OneSignal.InAppMessages.addEventListener('willDisplay', handleIamWillDisplay);
        OneSignal.InAppMessages.addEventListener('didDisplay', handleIamDidDisplay);
        OneSignal.InAppMessages.addEventListener('willDismiss', handleIamWillDismiss);
        OneSignal.InAppMessages.addEventListener('didDismiss', handleIamDidDismiss);
        OneSignal.InAppMessages.addEventListener('click', handleIamClick);
        OneSignal.Notifications.addEventListener('click', handleNotificationClick);
        OneSignal.Notifications.addEventListener('permissionChange', handlePermissionChange);
        OneSignal.Notifications.addEventListener(
          'foregroundWillDisplay',
          handleForegroundWillDisplay,
        );

        console.log(`OneSignal initialized with app ID: ${appId}`);
      } catch (err) {
        console.error(`Init error: ${String(err)}`);
      }
    };

    void init();

    // Fetch tooltips in background
    void TooltipHelper.getInstance().init();

    return () => {
      OneSignal.InAppMessages.removeEventListener('willDisplay', handleIamWillDisplay);
      OneSignal.InAppMessages.removeEventListener('didDisplay', handleIamDidDisplay);
      OneSignal.InAppMessages.removeEventListener('willDismiss', handleIamWillDismiss);
      OneSignal.InAppMessages.removeEventListener('didDismiss', handleIamDidDismiss);
      OneSignal.InAppMessages.removeEventListener('click', handleIamClick);
      OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
      OneSignal.Notifications.removeEventListener('permissionChange', handlePermissionChange);
      OneSignal.Notifications.removeEventListener(
        'foregroundWillDisplay',
        handleForegroundWillDisplay,
      );
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={AppColors.osPrimary} barStyle="light-content" />
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
                    <OneSignalLogo height={22} width={99} style={headerStyles.logo} />
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

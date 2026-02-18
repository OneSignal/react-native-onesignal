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
import { Colors } from './src/theme';

const Stack = createNativeStackNavigator();
const log = LogManager.getInstance();
const TAG = 'App';

function App() {
  useEffect(() => {
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

        console.log(
          'OneSignal.Notifications.getPermissionAsync: ',
          await OneSignal.Notifications.getPermissionAsync(),
        );

        // Register SDK event listeners for logging
        OneSignal.InAppMessages.addEventListener(
          'willDisplay',
          (e: InAppMessageWillDisplayEvent) => {
            log.i(TAG, `IAM willDisplay: ${e.message.messageId}`);
          },
        );
        OneSignal.InAppMessages.addEventListener(
          'didDisplay',
          (e: InAppMessageDidDisplayEvent) => {
            log.i(TAG, `IAM didDisplay: ${e.message.messageId}`);
          },
        );
        OneSignal.InAppMessages.addEventListener(
          'willDismiss',
          (e: InAppMessageWillDismissEvent) => {
            log.i(TAG, `IAM willDismiss: ${e.message.messageId}`);
          },
        );
        OneSignal.InAppMessages.addEventListener(
          'didDismiss',
          (e: InAppMessageDidDismissEvent) => {
            log.i(TAG, `IAM didDismiss: ${e.message.messageId}`);
          },
        );
        OneSignal.InAppMessages.addEventListener(
          'click',
          (e: InAppMessageClickEvent) => {
            log.i(TAG, `IAM click: ${e.result.actionId ?? 'unknown'}`);
          },
        );
        OneSignal.Notifications.addEventListener(
          'click',
          (e: NotificationClickEvent) => {
            log.i(TAG, `Notification click: ${e.notification.title ?? ''}`);
          },
        );
        OneSignal.Notifications.addEventListener(
          'permissionChange',
          (granted: boolean) => {
            log.i(TAG, `Permission changed: ${granted}`);
          },
        );
        OneSignal.Notifications.addEventListener(
          'foregroundWillDisplay',
          (e: NotificationWillDisplayEvent) => {
            log.i(
              TAG,
              `Notification foregroundWillDisplay: ${
                e.getNotification().title ?? ''
              }`,
            );
            e.preventDefault();
            e.getNotification().display();
          },
        );

        log.i(TAG, `OneSignal initialized with app ID: ${appId}`);
      } catch (err) {
        log.e(TAG, `Init error: ${String(err)}`);
      }
    };

    init();

    // Fetch tooltips in background
    TooltipHelper.getInstance().init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={Colors.oneSignalRed}
        barStyle="light-content"
      />
      <AppContextProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: Colors.oneSignalRed },
              headerTintColor: Colors.white,
              headerTitleAlign: 'center',
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
                    <Text style={headerStyles.subtitle}>Sample App</Text>
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
    color: Colors.white,
    opacity: 0.9,
  },
});

export default App;

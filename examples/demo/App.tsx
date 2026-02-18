import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  OneSignal,
  LogLevel,
  InAppMessageClickEvent,
  InAppMessageWillDisplayEvent,
  InAppMessageDidDisplayEvent,
  InAppMessageWillDismissEvent,
  InAppMessageDidDismissEvent,
  NotificationClickEvent,
  NotificationWillDisplayEvent,
} from 'react-native-onesignal';

import { AppContextProvider } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import SecondaryScreen from './src/screens/SecondaryScreen';
import PreferencesService from './src/services/PreferencesService';
import OneSignalApiService from './src/services/OneSignalApiService';
import TooltipHelper from './src/services/TooltipHelper';
import LogManager from './src/services/LogManager';
import { Colors } from './src/theme';

const Stack = createNativeStackNavigator();
const log = LogManager.getInstance();
const TAG = 'App';

function App() {
  useEffect(() => {
    const init = async () => {
      try {
        const prefs = PreferencesService.getInstance();
        const [appId, consentRequired, privacyConsent, iamPaused, locationShared] =
          await Promise.all([
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
        OneSignal.InAppMessages.addEventListener('willDisplay', (e: InAppMessageWillDisplayEvent) => {
          log.i(TAG, `IAM willDisplay: ${e.message.messageId}`);
        });
        OneSignal.InAppMessages.addEventListener('didDisplay', (e: InAppMessageDidDisplayEvent) => {
          log.i(TAG, `IAM didDisplay: ${e.message.messageId}`);
        });
        OneSignal.InAppMessages.addEventListener('willDismiss', (e: InAppMessageWillDismissEvent) => {
          log.i(TAG, `IAM willDismiss: ${e.message.messageId}`);
        });
        OneSignal.InAppMessages.addEventListener('didDismiss', (e: InAppMessageDidDismissEvent) => {
          log.i(TAG, `IAM didDismiss: ${e.message.messageId}`);
        });
        OneSignal.InAppMessages.addEventListener('click', (e: InAppMessageClickEvent) => {
          log.i(TAG, `IAM click: ${e.result.actionId ?? 'unknown'}`);
        });
        OneSignal.Notifications.addEventListener('click', (e: NotificationClickEvent) => {
          log.i(TAG, `Notification click: ${e.notification.title ?? ''}`);
        });
        OneSignal.Notifications.addEventListener('foregroundWillDisplay', (e: NotificationWillDisplayEvent) => {
          log.i(TAG, `Notification foregroundWillDisplay: ${e.getNotification().title ?? ''}`);
          e.preventDefault();
          e.getNotification().display();
        });

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
      <StatusBar backgroundColor={Colors.oneSignalRed} barStyle="light-content" />
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
                    <Text style={headerStyles.title}>OneSignal</Text>
                    <Text style={headerStyles.subtitle}> Sample App</Text>
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
      <Toast />
    </SafeAreaProvider>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.white,
    opacity: 0.9,
  },
});

export default App;

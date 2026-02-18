import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
                    <Svg width={26} height={26} viewBox="0 0 70 70" style={headerStyles.logo}>
                      <Path
                        d="M34.8106 0.345025C15.5675 0.383111 -0.107685 16.1805 0.000557241 35.4237C0.0499825 44.0258 3.27658 52.3062 9.06036 58.6738C14.8441 65.0414 22.7771 69.0471 31.3348 69.921C31.3907 69.9266 31.4472 69.9204 31.5006 69.9028C31.5539 69.8852 31.603 69.8565 31.6446 69.8187C31.6861 69.7809 31.7193 69.7348 31.7419 69.6834C31.7645 69.6319 31.7761 69.5763 31.7758 69.5201V35.2232H29.0657C28.9594 35.2232 28.8574 35.181 28.7822 35.1058C28.707 35.0306 28.6648 34.9286 28.6648 34.8223V29.4102C28.6648 29.3039 28.707 29.2019 28.7822 29.1267C28.8574 29.0515 28.9594 29.0093 29.0657 29.0093H37.5728C37.6791 29.0093 37.7811 29.0515 37.8563 29.1267C37.9314 29.2019 37.9737 29.3039 37.9737 29.4102V69.5201C37.9734 69.5763 37.9849 69.6319 38.0075 69.6834C38.0301 69.7348 38.0633 69.7809 38.1049 69.8187C38.1465 69.8565 38.1955 69.8852 38.2489 69.9028C38.3023 69.9204 38.3588 69.9266 38.4147 69.921C47.317 69.0121 55.5294 64.7164 61.3533 57.9223C67.1771 51.1281 70.1668 42.3555 69.7038 33.4189C69.2409 24.4823 65.3608 16.0654 58.8662 9.90943C52.3715 3.75341 43.7592 0.32918 34.8106 0.345025ZM44.7228 62.1516C44.6622 62.1731 44.5974 62.1798 44.5337 62.171C44.47 62.1622 44.4094 62.1382 44.3569 62.1011C44.3044 62.0639 44.2616 62.0147 44.2322 61.9575C44.2027 61.9004 44.1874 61.837 44.1876 61.7727V56.0479C44.1877 55.934 44.2202 55.8225 44.2812 55.7263C44.3423 55.6301 44.4294 55.5533 44.5324 55.5047C49.1635 53.3017 52.9013 49.5803 55.1247 44.959C57.3481 40.3377 57.9233 35.0947 56.7545 30.1013C55.5858 25.1079 52.7436 20.6648 48.7002 17.5102C44.6568 14.3557 39.6557 12.6797 34.528 12.7609C22.5972 12.9433 12.8073 22.5648 12.4284 34.4916C12.2897 38.8588 13.4263 43.1719 15.6992 46.9037C17.9722 50.6354 21.283 53.6242 25.2271 55.5047C25.3301 55.5533 25.4172 55.6301 25.4782 55.7263C25.5393 55.8225 25.5718 55.934 25.5719 56.0479V61.7727C25.5721 61.837 25.5568 61.9004 25.5273 61.9575C25.4979 62.0147 25.4551 62.0639 25.4026 62.1011C25.3501 62.1382 25.2895 62.1622 25.2258 62.171C25.1621 62.1798 25.0973 62.1731 25.0367 62.1516C19.4788 60.1122 14.6871 56.4048 11.3177 51.5369C7.94824 46.669 6.16583 40.8787 6.21449 34.9586C6.35079 19.3877 19.0753 6.67321 34.6522 6.55895C50.5659 6.43067 63.543 19.3396 63.543 35.2232C63.543 47.5749 55.6974 58.1265 44.7228 62.1516Z"
                        fill="white"
                      />
                    </Svg>
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
    marginRight: 8,
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

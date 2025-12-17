import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  LogLevel,
  NotificationWillDisplayEvent,
  OneSignal,
} from 'react-native-onesignal';
import { SafeAreaView } from 'react-native-safe-area-context';
import OSButtons from './OSButtons';
import OSConsole from './OSConsole';

const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

const OSDemo: React.FC = () => {
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

  useEffect(() => {
    console.log('Initializing OneSignal');
    OneSignal.initialize(APP_ID);
    OneSignal.Debug.setLogLevel(LogLevel.Debug);
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Setting up event listeners');

      const onForegroundWillDisplay = (event: NotificationWillDisplayEvent) => {
        OSLog(
          'OneSignal: notification will show in foreground:',
          event.getNotification().title,
        );

        OSLog('Should show after 25 seconds:');
        let i = 1;
        const interval = setInterval(() => {
          OSLog('Seconds passed:', i);
          i++;
          if (i > 25) {
            clearInterval(interval);
          }
        }, 1000);
        // OSLog('Preventing display');
        // event.preventDefault();

        // OSLog('Displaying notification');
        // event.getNotification().display();
      };

      const onNotificationClick = (event: unknown) => {
        OSLog('OneSignal: notification clicked:', event);
      };

      const onIAMClick = (event: unknown) => {
        OSLog('OneSignal IAM clicked:', event);
      };

      const onIAMWillDisplay = (event: unknown) => {
        OSLog('OneSignal: will display IAM: ', event);
      };

      const onIAMDidDisplay = (event: unknown) => {
        OSLog('OneSignal: did display IAM: ', event);
      };

      const onIAMWillDismiss = (event: unknown) => {
        OSLog('OneSignal: will dismiss IAM: ', event);
      };

      const onIAMDidDismiss = (event: unknown) => {
        OSLog('OneSignal: did dismiss IAM: ', event);
      };

      const onSubscriptionChange = (subscription: unknown) => {
        OSLog('OneSignal: subscription changed:', subscription);
      };

      const onPermissionChange = (granted: unknown) => {
        OSLog('OneSignal: permission changed:', granted);
      };

      const onUserChange = (event: unknown) => {
        OSLog('OneSignal: user changed: ', event);
      };

      const setup = async () => {
        // OneSignal.login('fadi-rna-11');
        const onesignalID = await OneSignal.User.getOnesignalId();
        console.log('OneSignal ID:', onesignalID);
        const externalID = await OneSignal.User.getExternalId();
        console.log('External ID:', externalID);
        const pushID = await OneSignal.User.pushSubscription.getIdAsync();
        console.log('Push ID:', pushID);

        OneSignal.Notifications.addEventListener(
          'foregroundWillDisplay',
          onForegroundWillDisplay,
        );
        // OneSignal.LiveActivities.setupDefault();
        // OneSignal.Notifications.addEventListener('click', onNotificationClick);
        // OneSignal.InAppMessages.addEventListener('click', onIAMClick);
        // OneSignal.InAppMessages.addEventListener(
        //   'willDisplay',
        //   onIAMWillDisplay,
        // );
        // OneSignal.InAppMessages.addEventListener('didDisplay', onIAMDidDisplay);
        // OneSignal.InAppMessages.addEventListener(
        //   'willDismiss',
        //   onIAMWillDismiss,
        // );
        // OneSignal.InAppMessages.addEventListener('didDismiss', onIAMDidDismiss);
        // OneSignal.User.pushSubscription.addEventListener(
        //   'change',
        //   onSubscriptionChange,
        // );
        // OneSignal.Notifications.addEventListener(
        //   'permissionChange',
        //   onPermissionChange,
        // );
        // OneSignal.User.addEventListener('change', onUserChange);
      };

      console.log('Setup');
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
    }, [OSLog]),
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
        <OSButtons loggingFunction={OSLog} inputFieldValue={inputValue} />
      </ScrollView>
    </SafeAreaView>
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
    flex: 0.5,
  },
  scrollView: {
    flex: 0.5,
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
    backgroundColor: '#007bff',
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
});

export default OSDemo;

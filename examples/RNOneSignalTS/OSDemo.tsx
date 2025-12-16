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

  const onForegroundWillDisplay = useCallback(
    (event: NotificationWillDisplayEvent) => {
      console.log('OneSignal: notification will show in foreground:', event);

      // console.log('Preventing display');
      // event.preventDefault();
    },
    [],
  );
  // const onForegroundWillDisplay = useCallback(
  //   (event: unknown) => {
  //     OSLog('OneSignal: notification will show in foreground:', event);
  //     // const notif = (
  //     //   event as { getNotification: () => { title: string } }
  //     // ).getNotification();

  //     // const cancelButton = {
  //     //   text: 'Cancel',
  //     //   onPress: () => {
  //     //     (event as { preventDefault: () => void }).preventDefault();
  //     //   },
  //     //   style: 'cancel' as const,
  //     // };

  //     // const completeButton = {
  //     //   text: 'Display',
  //     //   onPress: () => {
  //     //     (event as { getNotification: () => { display: () => void } })
  //     //       .getNotification()
  //     //       .display();
  //     //   },
  //     // };

  //     // Alert.alert(
  //     //   'Display notification?',
  //     //   notif.title,
  //     //   [cancelButton, completeButton],
  //     //   {
  //     //     cancelable: true,
  //     //   },
  //     // );
  //   },
  //   [OSLog],
  // );

  const onNotificationClick = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: notification clicked:', event);
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
    (granted: unknown) => {
      OSLog('OneSignal: permission changed:', granted);
    },
    [OSLog],
  );

  const onUserChange = useCallback(
    (event: unknown) => {
      OSLog('OneSignal: user changed: ', event);
    },
    [OSLog],
  );

  useEffect(() => {
    OneSignal.initialize(APP_ID);
    OneSignal.Debug.setLogLevel(LogLevel.None);
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Setting up event listeners');

      const setup = async () => {
        const externalID = await OneSignal.User.getExternalId();
        console.log('External ID:', externalID);
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

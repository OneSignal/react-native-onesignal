import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
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
  OneSignal,
} from 'react-native-onesignal';
import { SafeAreaView } from 'react-native-safe-area-context';
import OSButtons from './OSButtons';
import OSConsole from './OSConsole';

const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

const OSDemo: React.FC = () => {
  const [consoleValue, setConsoleValue] = useState('');
  const [inputValue, setInputValue] = useState('');

  const inputChange = useCallback((text: string) => {
    setInputValue(text);
  }, []);

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
    OneSignal.Debug.setLogLevel(LogLevel.None);
    OneSignal.initialize(APP_ID);
    const externalId = Platform.OS === 'ios' ? 'fadi-rn-ios' : 'fadi-rna-a11';
    OneSignal.login(externalId);

    const setup = async () => {
      const onesignalID = await OneSignal.User.getOnesignalId();
      const externalID = await OneSignal.User.getExternalId();
      const pushID = await OneSignal.User.pushSubscription.getIdAsync();
      const pushToken = await OneSignal.User.pushSubscription.getTokenAsync();
      console.log('OneSignal ID:', onesignalID);
      console.log('External ID:', externalID);
      console.log('Push ID:', pushID);
      console.log('Push Token:', pushToken);
    };

    setup();

    const onNotificationClick = (event: NotificationClickEvent) => {
      console.log('OneSignal: notification clicked:', event);
      // event.preventDefault();
      // event.notification.display();
    };

    OneSignal.Notifications.addEventListener('click', onNotificationClick);

    return () => {
      OneSignal.Notifications.removeEventListener('click', onNotificationClick);
    };
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

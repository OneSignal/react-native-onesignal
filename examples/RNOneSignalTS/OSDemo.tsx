import * as React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { renderButtonView } from './Helpers';
import OSButtons from './OSButtons';
import OSConsole from './OSConsole';

const APP_ID = '77e32082-ea27-42e3-a898-c72e141824ef';

export interface Props {
  name: string;
}

export interface State {
  name: string;
  consoleValue: string;
  inputValue: string;
}

class OSDemo extends React.Component<Props, State> {
  // Event listener references for cleanup
  private onForegroundWillDisplay = (event: any) => {
    this.OSLog('OneSignal: notification will show in foreground:', event);
    let notif = event.getNotification();

    const cancelButton = {
      text: 'Cancel',
      onPress: () => {
        event.preventDefault();
      },
      style: 'cancel',
    };

    const completeButton = {
      text: 'Display',
      onPress: () => {
        event.getNotification().display();
      },
    };

    Alert.alert(
      'Display notification?',
      notif.title,
      [cancelButton, completeButton],
      {
        cancelable: true,
      },
    );
  };

  private onNotificationClick = (event: any) => {
    this.OSLog('OneSignal: notification clicked:', event);
  };

  private onIAMClick = (event: any) => {
    this.OSLog('OneSignal IAM clicked:', event);
  };

  private onIAMWillDisplay = (event: any) => {
    this.OSLog('OneSignal: will display IAM: ', event);
  };

  private onIAMDidDisplay = (event: any) => {
    this.OSLog('OneSignal: did display IAM: ', event);
  };

  private onIAMWillDismiss = (event: any) => {
    this.OSLog('OneSignal: will dismiss IAM: ', event);
  };

  private onIAMDidDismiss = (event: any) => {
    this.OSLog('OneSignal: did dismiss IAM: ', event);
  };

  private onSubscriptionChange = (subscription: any) => {
    this.OSLog('OneSignal: subscription changed:', subscription);
  };

  private onPermissionChange = (granted: any) => {
    this.OSLog('OneSignal: permission changed:', granted);
  };

  private onUserChange = (event: any) => {
    this.OSLog('OneSignal: user changed: ', event);
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.name,
      inputValue: '',
      consoleValue: '',
    };
  }

  async componentDidMount() {
    OneSignal.initialize(APP_ID);
    OneSignal.Debug.setLogLevel(LogLevel.None);

    OneSignal.LiveActivities.setupDefault();
    // OneSignal.LiveActivities.setupDefault({
    //   enablePushToStart: false,
    //   enablePushToUpdate: true,
    // });

    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      this.onForegroundWillDisplay,
    );
    OneSignal.Notifications.addEventListener('click', this.onNotificationClick);
    OneSignal.InAppMessages.addEventListener('click', this.onIAMClick);
    OneSignal.InAppMessages.addEventListener(
      'willDisplay',
      this.onIAMWillDisplay,
    );
    OneSignal.InAppMessages.addEventListener(
      'didDisplay',
      this.onIAMDidDisplay,
    );
    OneSignal.InAppMessages.addEventListener(
      'willDismiss',
      this.onIAMWillDismiss,
    );
    OneSignal.InAppMessages.addEventListener(
      'didDismiss',
      this.onIAMDidDismiss,
    );
    OneSignal.User.pushSubscription.addEventListener(
      'change',
      this.onSubscriptionChange,
    );
    OneSignal.Notifications.addEventListener(
      'permissionChange',
      this.onPermissionChange,
    );
    OneSignal.User.addEventListener('change', this.onUserChange);
  }

  componentWillUnmount() {
    // Clean up all event listeners
    OneSignal.Notifications.removeEventListener(
      'foregroundWillDisplay',
      this.onForegroundWillDisplay,
    );
    OneSignal.Notifications.removeEventListener(
      'click',
      this.onNotificationClick,
    );
    OneSignal.InAppMessages.removeEventListener('click', this.onIAMClick);
    OneSignal.InAppMessages.removeEventListener(
      'willDisplay',
      this.onIAMWillDisplay,
    );
    OneSignal.InAppMessages.removeEventListener(
      'didDisplay',
      this.onIAMDidDisplay,
    );
    OneSignal.InAppMessages.removeEventListener(
      'willDismiss',
      this.onIAMWillDismiss,
    );
    OneSignal.InAppMessages.removeEventListener(
      'didDismiss',
      this.onIAMDidDismiss,
    );
    OneSignal.User.pushSubscription.removeEventListener(
      'change',
      this.onSubscriptionChange,
    );
    OneSignal.Notifications.removeEventListener(
      'permissionChange',
      this.onPermissionChange,
    );
    OneSignal.User.removeEventListener('change', this.onUserChange);
  }

  OSLog = (message: string, optionalArg: any = null) => {
    if (optionalArg !== null) {
      message = message + JSON.stringify(optionalArg);
    }

    console.log(message);

    let consoleValue;

    if (this.state.consoleValue) {
      consoleValue = `${this.state.consoleValue}\n${message}`;
    } else {
      consoleValue = message;
    }
    this.setState({ consoleValue });
  };

  inputChange = (text: string) => {
    this.setState({ inputValue: text });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>OneSignal</Text>
          <OSConsole value={this.state.consoleValue} />
          <View style={styles.clearButton}>
            {renderButtonView('X', () => {
              this.setState({ consoleValue: '' });
            })}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Input"
            onChangeText={this.inputChange}
          />
        </View>
        <ScrollView style={styles.scrollView}>
          <OSButtons
            loggingFunction={this.OSLog}
            inputFieldValue={this.state.inputValue}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

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
    paddingVertical: 10,
  },
  clearButton: {
    position: 'absolute',
    right: 0,
    top: 70,
  },
  input: {
    marginTop: 10,
  },
});

export default OSDemo;

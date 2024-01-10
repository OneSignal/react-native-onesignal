import {LogLevel, OneSignal} from 'react-native-onesignal';
import * as React from 'react';
import {Alert, StyleSheet, View, ScrollView, SafeAreaView} from 'react-native';
import OSButtons from './OSButtons';
import OSConsole from './OSConsole';
import {renderButtonView} from './Helpers';
import {TextInput, Text} from '@react-native-material/core';

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
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    OneSignal.Notifications.addEventListener(
      'foregroundWillDisplay',
      (event) => {
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
      },
    );

    OneSignal.Notifications.addEventListener('click', (event) => {
      this.OSLog('OneSignal: notification clicked:', event);
    });

    OneSignal.InAppMessages.addEventListener('click', (event) => {
      this.OSLog('OneSignal IAM clicked:', event);
    });

    OneSignal.InAppMessages.addEventListener('willDisplay', (event) => {
      this.OSLog('OneSignal: will display IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('didDisplay', (event) => {
      this.OSLog('OneSignal: did display IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('willDismiss', (event) => {
      this.OSLog('OneSignal: will dismiss IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('didDismiss', (event) => {
      this.OSLog('OneSignal: did dismiss IAM: ', event);
    });

    OneSignal.User.pushSubscription.addEventListener(
      'change',
      (subscription) => {
        this.OSLog('OneSignal: subscription changed:', subscription);
      },
    );

    OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
      this.OSLog('OneSignal: permission changed:', granted);
    });

    OneSignal.User.addEventListener('change', (event) => {
      this.OSLog('OneSignal: user changed: ', event);
    });
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
    this.setState({consoleValue});
  };

  inputChange = (text: string) => {
    this.setState({inputValue: text});
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>OneSignal</Text>
          <OSConsole value={this.state.consoleValue} />
          <View style={styles.clearButton}>
            {renderButtonView('X', () => {
              this.setState({consoleValue: ''});
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

import {OneSignal} from 'react-native-onesignal';
import * as React from 'react';
import {Alert, StyleSheet, View, ScrollView, SafeAreaView} from 'react-native';
import OSButtons from './OSButtons';
import OSConsole from './OSConsole';
import {renderButtonView} from './Helpers';
import {TextInput, Text} from "@react-native-material/core";

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
    OneSignal.Debug.setLogLevel(6);

    OneSignal.Notifications.setNotificationWillShowInForegroundHandler(
      (notifReceivedEvent) => {
        this.OSLog('OneSignal: notification will show in foreground:', notifReceivedEvent);
        const notification = notifReceivedEvent.getNotification();

        const cancelButton = {
          text: 'Cancel',
          onPress: () => {
            notifReceivedEvent.complete();
          },
          style: 'cancel',
        };

        const completeButton = {
          text: 'Complete',
          onPress: () => {
            notifReceivedEvent.complete(notification);
          },
        };

        Alert.alert('Complete notification?', notification.title, [cancelButton, completeButton], {
          cancelable: true,
        });
      },
    );

    OneSignal.Notifications.setNotificationClickHandler((notification) => {
      this.OSLog('OneSignal: notification opened:', notification);
    });

    OneSignal.InAppMessages.setClickHandler((event) => {
      this.OSLog('OneSignal IAM clicked:', event);
    });

    OneSignal.InAppMessages.setLifecycleHandler({
      onWillDisplayInAppMessage: (message) => {
        this.OSLog('OneSignal: will display IAM: ', message.messageId);
      },
      onDidDisplayInAppMessage: (message) => {
        this.OSLog('OneSignal: did display IAM: ', message.messageId);
      },
      onWillDismissInAppMessage: (message) => {
        this.OSLog('OneSignal: will dismiss IAM: ', message.messageId);
      },
      onDidDismissInAppMessage: (message) => {
        this.OSLog('OneSignal: did dismiss IAM: ', message.messageId);
      },
    });

    OneSignal.User.PushSubscription.addChangeHandler(granted=> {
      this.OSLog('OneSignal: subscription changed:', granted);
    });

    OneSignal.Notifications.addPermissionChangedHandler(granted => {
      this.OSLog('OneSignal: permission changed:', granted);
    });
  }

  componentWillUnmount() {
    OneSignal.clearHandlers();
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
    flex: .5,
  },
  scrollView: {
    flex: .5,
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

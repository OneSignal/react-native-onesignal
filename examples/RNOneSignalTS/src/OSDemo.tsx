import OneSignal from 'react-native-onesignal';
import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import OSButtons from './OSButtons';
import { SubscribeFields } from './models/SubscribeFields';
import OSConsole from './OSConsole';

export interface Props {
  name: string;
}

export interface State {
    name: string;
    isSubscribed: boolean;
    isLocationShared: boolean;
    requiresPrivacyConsent: boolean;
    consoleValue: string;
}

class OSDemo extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            name: props.name,
            isSubscribed: false,
            requiresPrivacyConsent: false,
            isLocationShared: false,
            consoleValue: ""
        }
    }

    async componentDidMount() {
        /* O N E S I G N A L   S E T U P */
        OneSignal.setAppId("ce8572ae-ff57-4e77-a265-5c91f00ecc4c");
        OneSignal.setLogLevel(6, 0);
        OneSignal.setRequiresUserPrivacyConsent(this.state.requiresPrivacyConsent);
        OneSignal.setLocationShared(true);
        OneSignal.promptForPushNotificationsWithUserResponse(response => {
            this.OSLog("Prompt response:", response);
        });

        /* O N E S I G N A L  H A N D L E R S */
        OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
            this.OSLog("OneSignal: notification will show in foreground:", notifReceivedEvent);
            let notif = notifReceivedEvent.getNotification();
            setTimeout(()=>notifReceivedEvent.complete(notif), 0);
        });
        OneSignal.setNotificationOpenedHandler(notification => {
            this.OSLog("OneSignal: notification opened:", notification);
        });
        OneSignal.setInAppMessageClickHandler(event => {
            this.OSLog("OneSignal IAM clicked:", event);
        });
        OneSignal.addEmailSubscriptionObserver((event) => {
            this.OSLog("OneSignal: email subscription changed: ", event);
        });
        OneSignal.addSubscriptionObserver(event => {
            this.OSLog("OneSignal: subscription changed:", event);
            this.setState({ isSubscribed: event.to.isSubscribed})
        });
        OneSignal.addPermissionObserver(event => {
            this.OSLog("OneSignal: permission changed:", event);
        });
        const state = await OneSignal.getDeviceState();

        this.setState({
            name : state.emailAddress,
            isSubscribed : state.isSubscribed
        });
    }

    OSLog = (message: string, optionalArg: Object) => {
        if (optionalArg) {
            message = message + JSON.stringify(optionalArg);
        }
        let consoleValue;

        if (this.state.consoleValue) {
            consoleValue = this.state.consoleValue+"\n"+message
        } else {
            consoleValue = message;
        }
        this.setState({ consoleValue });
    }

    render() {
        const subscribeFields : SubscribeFields = {
            isSubscribed        : this.state.isSubscribed,
        }

        return (
            <View style={styles.root}>
                <Text style={styles.title} >OneSignal</Text>
                <OSConsole value={this.state.consoleValue}/>
                <OSButtons subscribeFields={subscribeFields} loggingFunction={this.OSLog} />
            </View>
        );
    }
};

// styles
const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'center'
  },
  title: {
    fontSize: 40
  },
  buttons: {
    flexDirection: 'row',
    minHeight: 70,
    alignItems: 'stretch',
    alignSelf: 'center',
    borderWidth: 5
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    paddingVertical: 0
  },
  greeting: {
    color: '#999',
    fontWeight: 'bold'
  }
});

export default OSDemo;

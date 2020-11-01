import OneSignal from 'react-native-onesignal';
import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import OSButtons from './OSButtons';

export interface Props {
  name: string;
}

export interface State {
    name: string;
    isSubscribed: boolean;
    requiresPrivacyConsent: boolean
}

class OneSignalDemo extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            name: props.name,
            isSubscribed: false,
            requiresPrivacyConsent: false
        }
    }

    async componentDidMount() {
        /* O N E S I G N A L   S E T U P */
        OneSignal.setAppId("ce8572ae-ff57-4e77-a265-5c91f00ecc4c");
        OneSignal.setLogLevel(6, 0);
        OneSignal.setRequiresUserPrivacyConsent(this.state.requiresPrivacyConsent);
        OneSignal.setLocationShared(true);
        OneSignal.promptForPushNotificationsWithUserResponse(response => {
            console.log("Prompt response:", response);
        });

        /* O N E S I G N A L  H A N D L E R S */
        OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
            console.log("OneSignal: notification will show in foreground:", notifReceivedEvent);
            let notif = notifReceivedEvent.getNotification();
            setTimeout(()=>notifReceivedEvent.complete(notif), 0);
        });
        OneSignal.setNotificationOpenedHandler(notification => {
            console.log("OneSignal: notification opened:", notification);
        });
        OneSignal.setInAppMessageClickHandler(event => {
            console.log("OneSignal IAM clicked:", event);
        });
        OneSignal.addEmailSubscriptionObserver((event) => {
            console.log("OneSignal: email subscription changed: ", event);
        });
        OneSignal.addSubscriptionObserver(event => {
            console.log("OneSignal: subscription changed:", event);
            this.setState({ isSubscribed: event.to.isSubscribed})
        });
        OneSignal.addPermissionObserver(event => {
            console.log("OneSignal: permission changed:", event);
        });
        const state = await OneSignal.getDeviceState();

        this.setState({
            name : state.emailAddress,
            isSubscribed : state.isSubscribed
        });
    }

    render() {
        return (
            <View style={styles.root}>
                <Text>OneSignal</Text>
                <OSButtons isSubscribed={this.state.isSubscribed}/>
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

export default OneSignalDemo;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View
} from 'react-native';

import OneSignal from 'react-native-onesignal'; // Import package from node modules

// var pendingNotifications = []; if we're pending for an object to get initialized.

// function handleNotification (notification) { // If you want to handle the notifiaction with a payload.
    // _navigator.to('main.post', notification.data.title, {
    //  article: {
    //    title: notification.data.title,
    //    link: notification.data.url,
    //    action: notification.data.actionSelected
    //  }
    // });
// }

OneSignal.configure({
    onNotificationOpened: function(message, data, isActive) {
        console.log('MESSAGE: ', message);
        console.log('DATA: ', data);
        console.log('ISACTIVE: ', isActive);

        // var notification = {message: message, data: data, isActive: isActive};
        // console.log('NOTIFICATION OPENED: ', notification);
        //if (!_navigator) { // If we want to wait for an object to get initialized
        //    console.log('Navigator is null, adding notification to pending list...');
            // pendingNotifications.push(notification);
        //    return;
        // }
        // handleNotification(notification);
    }
});

OneSignal.idsAvailable((idsAvailable) => { 
    console.log(idsAvailable);
});

class AwesomeProject extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);

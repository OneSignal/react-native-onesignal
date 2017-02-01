/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

import OneSignal from 'react-native-onesignal';

OneSignal.configure({
  onIdsAvailable: function (device) {
    console.log('UserId = ', device.userId);
    console.log('PushToken = ', device.pushToken);
  },
  onNotificationReceived: function (notification) {
    console.log('NOTIFICATION RECEIVED: ', notification);
  },
  onNotificationOpened: function (openResult) {
    console.log('NOTIFICATION OPENED: ', openResult);
    console.log('MESSAGE: ', openResult.notification.payload.body);
    console.log('DATA: ', openResult.notification.payload.additionalData);
    console.log('ISACTIVE: ', openResult.notification.isAppInFocus);
  }
});

export default class RNOneSignal extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
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

AppRegistry.registerComponent('RNOneSignal', () => RNOneSignal);

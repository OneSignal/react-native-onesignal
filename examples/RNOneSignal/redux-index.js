/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

/**

    This example assumes there's a parent Component that returns the redux Provider
    wrapping its children with the same store as being imported here being passed
    as the store prop.

**/

import React, { Component } from "react";
import { connect } from "react-redux";
import { AppRegistry, AsyncStorage, StyleSheet } from "react-native";
import { persistStore } from "redux-persist"; // redux-persist@4.10.1 -- the API for ^5.x.x and rehydrating/purging the store is slightly different
import OneSignal from "react-native-onesignal";
import App from "./src/App";
import { store } from "./configureStore.js"; // Whereever you're creating and exporting your store from

// Action creator -- likely to be in the directory with the rest of your project's action creators
// placed here for the sake of example
const setInitialNotification = openResult => ({
  type: T.INITIAL_NOTIFICATION,
  payload: openResult.notification.payload.additionalData
});

// function to initially add onOpened listener to
// handles initial tap of push notification from an unopened AppState
const handleOnOpened = openResult => {
  console.log(`** INITIAL OPEN RESULT FROM APP.JS **`, openResult);
  console.log("Message: ", openResult.notification.payload.body);
  console.log("Data: ", openResult.notification.payload.additionalData);
  console.log("isActive: ", openResult.notification.isAppInFocus);
  console.log("openResult: ", openResult);

  store.dispatch(setInitialNotification(openResult));
};

OneSignal.configure({});
OneSignal.addEventListener("opened", handleOnOpened);

class UnconnectedRNOneSignal extends Component {
  state = {
    rehydrated: false
  };

  componentWillMount() {
    OneSignal.addEventListener("received", this.onReceived);
    OneSignal.addEventListener("registered", this.onRegistered);
    OneSignal.addEventListener("ids", this.onIds);

    this.rehydrateStore();
  }

  componentWillUnmount() {
    OneSignal.removeEventListener("received", this.onReceived);
    OneSignal.removeEventListener("opened", this.onOpened);
    OneSignal.removeEventListener("registered", this.onRegistered);
    OneSignal.removeEventListener("ids", this.onIds);
  }

  rehydrateStore = () => {
    persistStore(
      store,
      {
        // blacklist: ["logs", "statusMessages", "env"],
        storage: AsyncStorage,
        debounce: 50
      },
      () => {
        /*
          After rehydrating:
            - remove the 'opened' listener from the handleOnOpened function
            - add the 'opened' listener to this.onOpened
        */

        this.setState({ rehydrated: true }, () => {
          OneSignal.removeEventListener("opened", handleOnOpened); // removing
          OneSignal.addEventListener("opened", this.onOpened);
        });
      }
    );
  };

  onReceived = notification => {
    console.log("Notification received: ", notification);
  };

  onOpened = openResult => {
    console.log("Message: ", openResult.notification.payload.body);
    console.log("Data: ", openResult.notification.payload.additionalData);
    console.log("isActive: ", openResult.notification.isAppInFocus);
    console.log("openResult: ", openResult);
  };

  onRegistered = notifData => {
    console.log(
      "Device had been registered for push notifications!",
      notifData
    );
  };

  onIds = device => {
    console.log("Device info: ", device);
  };

  render() {
    const { rehydrated } = this.state;

    return (
      <App rehydrated={rehydrated} /> // Again, this entire component is being wrapped in redux Provider
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});

const mapStateToProps = state => {
  const { notifications } = state; // probably have a notifications reducer

  return {
    notifications
    // any other pieces of reducer states you may need
  };
};

const actionCreatorObj = {
  // whichever action creators responsible for push notifications in your app
  // and anything else relevant for this Component
};

const RNOneSignal = connect(mapStateToProps)(UnconnectedRNOneSignal);

export default RNOneSignal;

// AppRegistry.registerComponent("RNOneSignal", () => RNOneSignal); // this is going to happen in the file rending the Provider component and its children

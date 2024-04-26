import {LogLevel, OneSignal} from 'react-native-onesignal';
import * as React from 'react';
import {Alert, StyleSheet, View, ScrollView, SafeAreaView} from 'react-native';
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

  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>OneSignal</Text>
        </View>
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

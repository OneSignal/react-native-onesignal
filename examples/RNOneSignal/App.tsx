/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import OSDemo from './OSDemo';

function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.body}>
        <OSDemo name="OneSignal" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 10,
  },
});

export default App;

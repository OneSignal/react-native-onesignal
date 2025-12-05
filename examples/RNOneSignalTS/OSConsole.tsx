/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useCallback, useRef } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export interface Props {
  value: string;
}

const OSConsole: React.FC<Props> = ({ value }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToEnd = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <SafeAreaView style={styles.body}>
      <ScrollView
        nestedScrollEnabled={true}
        style={styles.scrollView}
        ref={scrollViewRef}
        onContentSizeChange={scrollToEnd}
      >
        <View style={styles.console}>
          <Text
            style={
              Platform.OS === 'android' ? styles.textAndroid : styles.textIOS
            }
          >
            {value}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f8f9fa',
  },
  body: {
    backgroundColor: 'grey',
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
  },
  console: {
    flexWrap: 'wrap',
    padding: 10,
    flexDirection: 'row',
  },
  textIOS: {
    fontFamily: 'Courier',
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 10,
  },
  textAndroid: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 10,
  },
});

export default OSConsole;

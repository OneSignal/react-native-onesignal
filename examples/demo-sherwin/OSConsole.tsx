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
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export interface Props {
  value: string;
}

const OSConsole: React.FC<Props> = ({ value }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToEnd = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  return (
    <View style={styles.body}>
      <ScrollView
        nestedScrollEnabled={true}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
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
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  body: {
    backgroundColor: '#f8f9fa',
    flex: 1,
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
    color: '#000',
  },
  textAndroid: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: 10,
    color: '#000',
  },
});

export default OSConsole;

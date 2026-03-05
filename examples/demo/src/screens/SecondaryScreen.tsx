import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SecondaryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Secondary Activity</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
  },
});

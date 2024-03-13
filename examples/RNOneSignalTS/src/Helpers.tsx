import * as React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from 'react-native';
import {Button} from '@react-native-material/core';

const disabledColor = '#BEBEBE';

export const renderButtonView = (name: string, callback: Function) => {
  return (
    <View key={name + '_parent'} style={styles.buttonContainer}>
      <Button
        key={name}
        title={name}
        onPress={() => {
          callback();
        }}
      />
    </View>
  );
};

export const renderFieldView = (
  name: string,
  value: string,
  callback: (text: string) => void,
) => {
  return (
    <KeyboardAvoidingView
      key={name + '_keyboard_avoiding_view'}
      style={{
        width: 300,
        height: 40,
        borderWidth: 2,
        borderRadius: 5,
        marginTop: 8,
      }}
    >
      <TextInput
        key={name}
        style={styles.textInput}
        placeholder={name}
        value={value}
        multiline={false}
        returnKeyType="done"
        textAlign="center"
        placeholderTextColor="#d1dde3"
        editable={true}
        autoCapitalize="none"
        onChangeText={callback}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  textInput: {
    marginHorizontal: 10,
    height: 40,
  },
});

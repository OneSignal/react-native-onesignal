import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

// const disabledColor = '#BEBEBE';

export const renderButtonView = (name: string, callback: Function) => {
  return (
    <TouchableOpacity
      key={name + '_parent'}
      style={styles.buttonContainer}
      onPress={() => {
        callback();
      }}
    >
      <Text style={styles.buttonText}>{name}</Text>
    </TouchableOpacity>
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
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginVertical: 10,
    marginHorizontal: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    marginHorizontal: 10,
    height: 40,
  },
});

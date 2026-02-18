import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../../theme';

type OutcomeType = 'normal' | 'unique' | 'withValue';

interface Props {
  visible: boolean;
  onSendNormal: (name: string) => void;
  onSendUnique: (name: string) => void;
  onSendWithValue: (name: string, value: number) => void;
  onClose: () => void;
}

export default function OutcomeModal({
  visible,
  onSendNormal,
  onSendUnique,
  onSendWithValue,
  onClose,
}: Props) {
  const [outcomeType, setOutcomeType] = useState<OutcomeType>('normal');
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const canSubmit =
    name.trim() &&
    (outcomeType !== 'withValue' ||
      (value.trim() && !isNaN(parseFloat(value))));

  const handleSend = () => {
    if (!canSubmit) {
      return;
    }
    switch (outcomeType) {
      case 'normal':
        onSendNormal(name.trim());
        break;
      case 'unique':
        onSendUnique(name.trim());
        break;
      case 'withValue':
        onSendWithValue(name.trim(), parseFloat(value));
        break;
    }
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setValue('');
    setOutcomeType('normal');
    onClose();
  };

  const RadioOption = ({
    type,
    label,
  }: {
    type: OutcomeType;
    label: string;
  }) => (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={() => setOutcomeType(type)}
    >
      <View style={styles.radioOuter}>
        {outcomeType === type && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Send Outcome</Text>
          <RadioOption type="normal" label="Normal Outcome" />
          <RadioOption type="unique" label="Unique Outcome" />
          <RadioOption type="withValue" label="Outcome with Value" />
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#9E9E9E"
            value={name}
            onChangeText={setName}
            autoFocus
            testID="outcome_name_input"
          />
          {outcomeType === 'withValue' && (
            <TextInput
              style={styles.input}
              placeholder="Value"
              placeholderTextColor="#9E9E9E"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              testID="outcome_value_input"
            />
          )}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, !canSubmit && styles.disabled]}
              onPress={handleSend}
              disabled={!canSubmit}
            >
              <Text style={styles.confirmText}>SEND</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.oneSignalRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.oneSignalRed,
  },
  radioLabel: {
    fontSize: 14,
    color: '#212121',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.dividerColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#212121',
    marginTop: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.oneSignalRed,
  },
  disabled: {
    opacity: 0.5,
  },
});

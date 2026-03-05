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
import { AppColors, AppTextStyles, AppDialogStyles } from '../../theme';

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
        style={AppDialogStyles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={AppDialogStyles.container}>
          <Text style={AppDialogStyles.title}>Send Outcome</Text>
          <RadioOption type="normal" label="Normal Outcome" />
          <RadioOption type="unique" label="Unique Outcome" />
          <RadioOption type="withValue" label="Outcome with Value" />
          <TextInput
            style={[AppDialogStyles.input, styles.inputSpacing]}
            placeholder="Name"
            placeholderTextColor={AppColors.osGrey600}
            value={name}
            onChangeText={setName}
            autoFocus
            testID="outcome_name_input"
          />
          {outcomeType === 'withValue' && (
            <TextInput
              style={[AppDialogStyles.input, styles.inputSpacing]}
              placeholder="Value"
              placeholderTextColor={AppColors.osGrey600}
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
              testID="outcome_value_input"
            />
          )}
          <View style={AppDialogStyles.actions}>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={handleClose}
            >
              <Text style={AppDialogStyles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={AppDialogStyles.actionBtn}
              onPress={handleSend}
              disabled={!canSubmit}
            >
              <Text
                style={[
                  AppDialogStyles.actionText,
                  !canSubmit && AppDialogStyles.actionTextDisabled,
                ]}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderColor: AppColors.osPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.osPrimary,
  },
  radioLabel: {
    ...AppTextStyles.bodyLarge,
    color: '#212121',
  },
  inputSpacing: {
    marginTop: 12,
  },
});

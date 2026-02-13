import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';
import { SendOutcomeDialog, OutcomeType } from '../dialogs/SendOutcomeDialog';

interface OutcomeSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function OutcomeSection({ loggingFunction }: OutcomeSectionProps) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleSendOutcome = (
    type: OutcomeType,
    name: string,
    value?: number,
  ) => {
    switch (type) {
      case 'normal':
        loggingFunction('Sending normal outcome: ', name);
        OneSignal.Session.addOutcome(name);
        break;
      case 'unique':
        loggingFunction('Sending unique outcome: ', name);
        OneSignal.Session.addUniqueOutcome(name);
        break;
      case 'withValue':
        loggingFunction(`Sending outcome ${name} with value: `, value);
        if (value !== undefined) {
          OneSignal.Session.addOutcomeWithValue(name, value);
        }
        break;
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Outcome Events" tooltipKey="outcomes" />
      <ActionButton
        title="Send Outcome"
        onPress={() => setDialogVisible(true)}
      />
      <SendOutcomeDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={handleSendOutcome}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});

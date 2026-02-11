import React, { useState } from 'react';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';
import { SendOutcomeDialog } from '../dialogs/SendOutcomeDialog';

interface OutcomeSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function OutcomeSection({ loggingFunction }: OutcomeSectionProps) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleSendOutcome = (name: string, value?: number) => {
    if (value !== undefined) {
      loggingFunction(`Sending outcome ${name} with value: `, value);
      OneSignal.Session.addOutcomeWithValue(name, value);
    } else {
      loggingFunction('Sending outcome: ', name);
      OneSignal.Session.addOutcome(name);
    }
  };

  return (
    <Card>
      <SectionHeader title="Outcomes" />
      <ActionButton
        title="Send Outcome"
        onPress={() => setDialogVisible(true)}
      />
      <SendOutcomeDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={handleSendOutcome}
      />
    </Card>
  );
}

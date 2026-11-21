import React, { useState } from 'react';

import ActionButton from '../ActionButton';
import OutcomeModal from '../modals/OutcomeModal';
import SectionCard from '../SectionCard';
import { useSnackbar } from '../ToastProvider';

interface Props {
  onSendNormal: (name: string) => void;
  onSendUnique: (name: string) => void;
  onSendWithValue: (name: string, value: number) => void;
  onInfoTap?: () => void;
}

export default function OutcomesSection({
  onSendNormal,
  onSendUnique,
  onSendWithValue,
  onInfoTap,
}: Props) {
  const [open, setOpen] = useState(false);
  const showSnackbar = useSnackbar();

  const handleSendNormal = (name: string) => {
    onSendNormal(name);
    showSnackbar(`Outcome sent: ${name}`);
  };

  const handleSendUnique = (name: string) => {
    onSendUnique(name);
    showSnackbar(`Unique outcome sent: ${name}`);
  };

  const handleSendWithValue = (name: string, value: number) => {
    onSendWithValue(name, value);
    showSnackbar(`Outcome sent: ${name} = ${value}`);
  };

  return (
    <SectionCard title="Outcome Events" onInfoTap={onInfoTap} sectionKey="outcomes">
      <ActionButton
        label="SEND OUTCOME"
        onPress={() => setOpen(true)}
        testID="send_outcome_button"
      />
      <OutcomeModal
        visible={open}
        onSendNormal={handleSendNormal}
        onSendUnique={handleSendUnique}
        onSendWithValue={handleSendWithValue}
        onClose={() => setOpen(false)}
      />
    </SectionCard>
  );
}

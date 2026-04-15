import React, { useState } from 'react';

import { showSnackbar } from '../../utils/showSnackbar';
import ActionButton from '../ActionButton';
import OutcomeModal from '../modals/OutcomeModal';
import SectionCard from '../SectionCard';

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
  const [modalVisible, setModalVisible] = useState(false);

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
        onPress={() => setModalVisible(true)}
        testID="send_outcome_button"
      />
      <OutcomeModal
        visible={modalVisible}
        onSendNormal={handleSendNormal}
        onSendUnique={handleSendUnique}
        onSendWithValue={handleSendWithValue}
        onClose={() => setModalVisible(false)}
      />
    </SectionCard>
  );
}

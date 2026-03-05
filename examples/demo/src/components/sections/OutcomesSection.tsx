import React, { useState } from 'react';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import OutcomeModal from '../modals/OutcomeModal';

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

  return (
    <SectionCard title="Outcome Events" onInfoTap={onInfoTap}>
      <ActionButton
        label="SEND OUTCOME"
        onPress={() => setModalVisible(true)}
        testID="send_outcome_button"
      />
      <OutcomeModal
        visible={modalVisible}
        onSendNormal={onSendNormal}
        onSendUnique={onSendUnique}
        onSendWithValue={onSendWithValue}
        onClose={() => setModalVisible(false)}
      />
    </SectionCard>
  );
}

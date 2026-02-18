import React, { useState } from 'react';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import { CollapsibleSingleList } from '../ListWidgets';

interface Props {
  smsNumbers: string[];
  onAdd: (sms: string) => void;
  onRemove: (sms: string) => void;
  onInfoTap?: () => void;
}

export default function SmsSection({ smsNumbers, onAdd, onRemove, onInfoTap }: Props) {
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SectionCard title="SMS" onInfoTap={onInfoTap}>
      <CollapsibleSingleList
        items={smsNumbers}
        onDelete={onRemove}
        emptyMessage="No SMS added"
      />
      <ActionButton
        label="ADD SMS"
        onPress={() => setAddVisible(true)}
        testID="add_sms_button"
      />
      <SingleInputModal
        visible={addVisible}
        title="Add SMS"
        placeholder="Phone number"
        onConfirm={onAdd}
        onClose={() => setAddVisible(false)}
        keyboardType="phone-pad"
        testID="sms_input"
      />
    </SectionCard>
  );
}

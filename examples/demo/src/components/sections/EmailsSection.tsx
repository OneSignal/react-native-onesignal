import React, { useState } from 'react';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import { CollapsibleSingleList } from '../ListWidgets';

interface Props {
  emails: string[];
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
  onInfoTap?: () => void;
}

export default function EmailsSection({ emails, onAdd, onRemove, onInfoTap }: Props) {
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SectionCard title="Emails" onInfoTap={onInfoTap}>
      <CollapsibleSingleList
        items={emails}
        onDelete={onRemove}
        emptyMessage="No emails added"
      />
      <ActionButton
        label="ADD EMAIL"
        onPress={() => setAddVisible(true)}
        testID="add_email_button"
      />
      <SingleInputModal
        visible={addVisible}
        title="Add Email"
        placeholder="Email address"
        onConfirm={onAdd}
        onClose={() => setAddVisible(false)}
        keyboardType="email-address"
        testID="email_input"
      />
    </SectionCard>
  );
}

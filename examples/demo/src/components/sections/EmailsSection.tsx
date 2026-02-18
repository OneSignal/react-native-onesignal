import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import { CollapsibleSingleList } from '../ListWidgets';
import { Spacing } from '../../theme';

interface Props {
  emails: string[];
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
  onInfoTap?: () => void;
}

export default function EmailsSection({
  emails,
  onAdd,
  onRemove,
  onInfoTap,
}: Props) {
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SectionCard title="Emails" onInfoTap={onInfoTap}>
      <View style={styles.listCard}>
        <CollapsibleSingleList
          items={emails}
          onDelete={onRemove}
          emptyMessage="No emails added"
        />
      </View>
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

const styles = StyleSheet.create({
  listCard: {
    marginBottom: Spacing.cardGap,
  },
});

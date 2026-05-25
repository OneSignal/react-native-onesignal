import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import { CollapsibleSingleList } from '../ListWidgets';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface Props {
  emails: string[];
  loading?: boolean;
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
  onInfoTap?: () => void;
}

export default function EmailsSection({
  emails,
  loading = false,
  onAdd,
  onRemove,
  onInfoTap,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SectionCard title="Emails" onInfoTap={onInfoTap} sectionKey="emails">
      <View style={styles.listCard}>
        <CollapsibleSingleList
          items={emails}
          onDelete={onRemove}
          emptyMessage="No emails added"
          loading={loading}
          sectionKey="emails"
        />
      </View>
      <ActionButton label="ADD EMAIL" onPress={() => setAddOpen(true)} testID="add_email_button" />
      <SingleInputModal
        visible={addOpen}
        title="Add Email"
        placeholder="Email address"
        onConfirm={onAdd}
        onClose={() => setAddOpen(false)}
        keyboardType="email-address"
        testID="email_input"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginBottom: AppSpacing.gap,
  },
});

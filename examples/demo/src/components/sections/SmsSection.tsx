import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import { CollapsibleSingleList } from '../ListWidgets';
import SingleInputModal from '../modals/SingleInputModal';
import SectionCard from '../SectionCard';

interface Props {
  smsNumbers: string[];
  loading?: boolean;
  onAdd: (sms: string) => void;
  onRemove: (sms: string) => void;
  onInfoTap?: () => void;
}

export default function SmsSection({
  smsNumbers,
  loading = false,
  onAdd,
  onRemove,
  onInfoTap,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <SectionCard title="SMS" onInfoTap={onInfoTap} sectionKey="sms">
      <View style={styles.listCard}>
        <CollapsibleSingleList
          items={smsNumbers}
          onDelete={onRemove}
          emptyMessage="No SMS added"
          loading={loading}
          sectionKey="sms"
        />
      </View>
      <ActionButton label="ADD SMS" onPress={() => setAddOpen(true)} testID="add_sms_button" />
      <SingleInputModal
        visible={addOpen}
        title="Add SMS"
        placeholder="Phone number"
        onConfirm={onAdd}
        onClose={() => setAddOpen(false)}
        keyboardType="phone-pad"
        testID="sms_input"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  listCard: {
    marginBottom: AppSpacing.gap,
  },
});

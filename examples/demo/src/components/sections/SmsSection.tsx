import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import SingleInputModal from '../modals/SingleInputModal';
import { CollapsibleSingleList } from '../ListWidgets';
import { Spacing } from '../../theme';

interface Props {
  smsNumbers: string[];
  onAdd: (sms: string) => void;
  onRemove: (sms: string) => void;
  onInfoTap?: () => void;
}

export default function SmsSection({
  smsNumbers,
  onAdd,
  onRemove,
  onInfoTap,
}: Props) {
  const [addVisible, setAddVisible] = useState(false);

  return (
    <SectionCard title="SMS" onInfoTap={onInfoTap}>
      <View style={styles.listCard}>
        <CollapsibleSingleList
          items={smsNumbers}
          onDelete={onRemove}
          emptyMessage="No SMS added"
        />
      </View>
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

const styles = StyleSheet.create({
  listCard: {
    marginBottom: Spacing.cardGap,
  },
});

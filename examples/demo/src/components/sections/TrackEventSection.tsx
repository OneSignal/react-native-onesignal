import React, { useState } from 'react';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import TrackEventModal from '../modals/TrackEventModal';

interface Props {
  onTrackEvent: (name: string, properties?: Record<string, unknown>) => void;
  onInfoTap?: () => void;
}

export default function TrackEventSection({ onTrackEvent, onInfoTap }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SectionCard title="Track Event" onInfoTap={onInfoTap}>
      <ActionButton
        label="TRACK EVENT"
        onPress={() => setModalVisible(true)}
        testID="track_event_button"
      />
      <TrackEventModal
        visible={modalVisible}
        onConfirm={(name, properties) => {
          onTrackEvent(name, properties);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </SectionCard>
  );
}

import React, { useState } from 'react';
import Toast from 'react-native-toast-message';

import ActionButton from '../ActionButton';
import TrackEventModal from '../modals/TrackEventModal';
import SectionCard from '../SectionCard';

interface Props {
  onTrackEvent: (name: string, properties?: Record<string, unknown>) => void;
  onInfoTap?: () => void;
}

export default function TrackEventSection({ onTrackEvent, onInfoTap }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SectionCard title="Custom Events" onInfoTap={onInfoTap} sectionKey="custom_events">
      <ActionButton
        label="TRACK EVENT"
        onPress={() => setModalVisible(true)}
        testID="track_event_button"
      />
      <TrackEventModal
        visible={modalVisible}
        onConfirm={(name, properties) => {
          onTrackEvent(name, properties);
          Toast.show({ type: 'info', text1: `Event tracked: ${name}` });
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </SectionCard>
  );
}

import React, { useState } from 'react';

import { showSnackbar } from '../../utils/showSnackbar';
import ActionButton from '../ActionButton';
import TrackEventModal from '../modals/TrackEventModal';
import SectionCard from '../SectionCard';

interface Props {
  onTrackEvent: (name: string, properties?: Record<string, unknown>) => void;
  onInfoTap?: () => void;
}

export default function CustomEventsSection({ onTrackEvent, onInfoTap }: Props) {
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
          showSnackbar(`Event tracked: ${name}`);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </SectionCard>
  );
}

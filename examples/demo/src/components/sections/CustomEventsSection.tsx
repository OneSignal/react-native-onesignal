import React, { useState } from 'react';

import ActionButton from '../ActionButton';
import TrackEventModal from '../modals/TrackEventModal';
import SectionCard from '../SectionCard';
import { useSnackbar } from '../ToastProvider';

interface Props {
  onTrackEvent: (name: string, properties?: Record<string, unknown>) => void;
  onInfoTap?: () => void;
}

export default function CustomEventsSection({ onTrackEvent, onInfoTap }: Props) {
  const [open, setOpen] = useState(false);
  const showSnackbar = useSnackbar();

  return (
    <SectionCard title="Custom Events" onInfoTap={onInfoTap} sectionKey="custom_events">
      <ActionButton label="TRACK EVENT" onPress={() => setOpen(true)} testID="track_event_button" />
      <TrackEventModal
        visible={open}
        onConfirm={(name, properties) => {
          onTrackEvent(name, properties);
          showSnackbar(`Event tracked: ${name}`);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </SectionCard>
  );
}

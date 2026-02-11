import React, { useState } from 'react';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';
import { TrackEventDialog } from '../dialogs/TrackEventDialog';

interface TrackEventSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function TrackEventSection({ loggingFunction }: TrackEventSectionProps) {
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleTrackEvent = (name: string, value?: string) => {
    if (value) {
      loggingFunction(`Tracking event ${name} with value: `, value);
      // Track event with properties if value is provided
      OneSignal.User.addTag(`event_${name}`, value);
    } else {
      loggingFunction('Tracking event: ', name);
      // Track event without properties
      OneSignal.User.addTag(`event_${name}`, 'triggered');
    }
  };

  return (
    <Card>
      <SectionHeader title="Track Event" tooltipKey="trackEvent" />
      <ActionButton
        title="Track Event"
        onPress={() => setDialogVisible(true)}
      />
      <TrackEventDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onConfirm={handleTrackEvent}
      />
    </Card>
  );
}

import React, { useState } from 'react';

import { NotificationType } from '../../models/NotificationType';
import ActionButton from '../ActionButton';
import CustomNotificationModal from '../modals/CustomNotificationModal';
import SectionCard from '../SectionCard';

interface Props {
  onSendNotification: (type: NotificationType) => void;
  onSendCustomNotification: (title: string, body: string) => void;
  onClearAll: () => void;
  onInfoTap?: () => void;
}

export default function SendPushSection({
  onSendNotification,
  onSendCustomNotification,
  onClearAll,
  onInfoTap,
}: Props) {
  const [customVisible, setCustomVisible] = useState(false);

  return (
    <SectionCard title="Send Push Notification" onInfoTap={onInfoTap} sectionKey="send_push">
      <ActionButton
        label="SIMPLE"
        onPress={() => onSendNotification(NotificationType.Simple)}
        testID="send_simple_button"
      />
      <ActionButton
        label="WITH IMAGE"
        onPress={() => onSendNotification(NotificationType.WithImage)}
        testID="send_image_button"
      />
      <ActionButton
        label="WITH SOUND"
        onPress={() => onSendNotification(NotificationType.WithSound)}
        testID="send_sound_button"
      />
      <ActionButton
        label="CUSTOM"
        onPress={() => setCustomVisible(true)}
        testID="send_custom_button"
      />
      <ActionButton
        label="CLEAR ALL"
        variant="outlined"
        onPress={onClearAll}
        testID="clear_all_button"
      />
      <CustomNotificationModal
        visible={customVisible}
        onConfirm={(title, body) => {
          onSendCustomNotification(title, body);
          setCustomVisible(false);
        }}
        onClose={() => setCustomVisible(false)}
      />
    </SectionCard>
  );
}

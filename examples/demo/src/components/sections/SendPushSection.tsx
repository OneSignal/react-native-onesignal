import React, { useState } from 'react';
import SectionCard from '../SectionCard';
import ActionButton from '../ActionButton';
import CustomNotificationModal from '../modals/CustomNotificationModal';
import { NotificationType } from '../../models/NotificationType';

interface Props {
  onSendNotification: (type: NotificationType) => void;
  onSendCustomNotification: (title: string, body: string) => void;
  onInfoTap?: () => void;
}

export default function SendPushSection({
  onSendNotification,
  onSendCustomNotification,
  onInfoTap,
}: Props) {
  const [customVisible, setCustomVisible] = useState(false);

  return (
    <SectionCard title="Send Push Notification" onInfoTap={onInfoTap}>
      <ActionButton
        label="SIMPLE"
        onPress={() => onSendNotification(NotificationType.Simple)}
        testID="send_simple_push_button"
      />
      <ActionButton
        label="WITH IMAGE"
        onPress={() => onSendNotification(NotificationType.WithImage)}
        testID="send_image_push_button"
      />
      <ActionButton
        label="CUSTOM"
        onPress={() => setCustomVisible(true)}
        testID="send_custom_push_button"
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

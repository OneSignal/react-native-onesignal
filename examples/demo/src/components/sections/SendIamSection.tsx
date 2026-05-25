import React from 'react';

import { InAppMessageType, iamTypeLabel } from '../../models/InAppMessageType';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface Props {
  onSendIam: (type: InAppMessageType) => void;
  onInfoTap?: () => void;
}

const IAM_TYPES: InAppMessageType[] = [
  InAppMessageType.TopBanner,
  InAppMessageType.BottomBanner,
  InAppMessageType.CenterModal,
  InAppMessageType.FullScreen,
];

export default function SendIamSection({ onSendIam, onInfoTap }: Props) {
  return (
    <SectionCard title="Send In-App Message" onInfoTap={onInfoTap} sectionKey="send_iam">
      {IAM_TYPES.map((type) => (
        <ActionButton
          key={type}
          label={iamTypeLabel[type]}
          onPress={() => onSendIam(type)}
          testID={`send_iam_${type}_button`}
        />
      ))}
    </SectionCard>
  );
}

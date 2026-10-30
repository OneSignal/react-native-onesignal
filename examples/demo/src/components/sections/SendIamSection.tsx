import React from 'react';
import { StyleSheet, View } from 'react-native';

import { InAppMessageType, iamTypeLabel } from '../../models/InAppMessageType';
import { AppSpacing } from '../../theme';
import ActionButton from '../ActionButton';
import SectionCard from '../SectionCard';

interface Props {
  onSendIam: (type: InAppMessageType) => void;
  onInfoTap?: () => void;
}

const IAM_TYPE_ROWS: InAppMessageType[][] = [
  [InAppMessageType.TopBanner, InAppMessageType.BottomBanner],
  [InAppMessageType.CenterModal, InAppMessageType.Html],
  [InAppMessageType.FullScreen, InAppMessageType.FullBleed],
  [InAppMessageType.Carousel, InAppMessageType.CarouselBleed],
];

export default function SendIamSection({ onSendIam, onInfoTap }: Props) {
  return (
    <SectionCard title="Send In-App Message" onInfoTap={onInfoTap} sectionKey="send_iam">
      {IAM_TYPE_ROWS.map((row) => (
        <View key={row.join('-')} style={styles.row}>
          {row.map((type) => (
            <View key={type} style={styles.cell}>
              <ActionButton
                label={iamTypeLabel[type]}
                onPress={() => onSendIam(type)}
                testID={`send_iam_${type}_button`}
                compact
              />
            </View>
          ))}
        </View>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    columnGap: AppSpacing.gap,
  },
  cell: {
    flex: 1,
  },
});

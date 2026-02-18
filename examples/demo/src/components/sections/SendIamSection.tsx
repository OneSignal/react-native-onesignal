import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SectionCard from '../SectionCard';
import { InAppMessageType, iamTypeLabel, iamTypeIcon } from '../../models/InAppMessageType';
import { Colors, Spacing } from '../../theme';

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
    <SectionCard title="Send In-App Message" onInfoTap={onInfoTap}>
      {IAM_TYPES.map(type => (
        <TouchableOpacity
          key={type}
          style={styles.button}
          onPress={() => onSendIam(type)}
          activeOpacity={0.8}
          testID={`send_iam_${type}_button`}
        >
          <View style={styles.inner}>
            <Icon
              name={iamTypeIcon[type]}
              size={20}
              color={Colors.white}
              style={styles.icon}
            />
            <Text style={styles.label}>{iamTypeLabel[type]}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.destructiveRed,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: Spacing.cardGap,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

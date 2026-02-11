import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ActionButton } from '../common/ActionButton';
import { RootTabParamList } from '../../App';

type NavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

export function NavigationSection() {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigate = () => {
    navigation.navigate('Details');
  };

  return (
    <Card>
      <SectionHeader title="Navigation" tooltipKey="navigation" />
      <ActionButton title="Go to Details" onPress={handleNavigate} />
    </Card>
  );
}

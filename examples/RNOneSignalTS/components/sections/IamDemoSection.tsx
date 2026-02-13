import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { SectionHeader } from '../common/SectionHeader';
import { IamTypes } from '../../constants/IamTemplates';
import { Colors } from '../../constants/Colors';

interface IamDemoSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function IamDemoSection({ loggingFunction }: IamDemoSectionProps) {
  const handleIamDemo = (type: string, title: string) => {
    loggingFunction(`Triggering ${title} IAM demo`);
    // Add a trigger to display the IAM
    // The IAM should be configured in OneSignal dashboard to respond to this trigger
    OneSignal.InAppMessages.addTrigger('iam_type', type);
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Send In-App Message" tooltipKey="sendInAppMessage" />
      {IamTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={styles.button}
          onPress={() => handleIamDemo(type.id, type.title)}
        >
          <Text style={styles.icon}>{type.icon}</Text>
          <Text style={styles.buttonText}>{type.title.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
  },
  icon: {
    fontSize: 20,
    color: Colors.white,
    marginRight: 8,
  },
});

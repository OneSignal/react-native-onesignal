import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
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
    <Card>
      <SectionHeader title="Send In-App Message" tooltipKey="sendInAppMessage" />
      {IamTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={styles.button}
          onPress={() => handleIamDemo(type.id, type.title)}
        >
          <Text style={styles.buttonText}>{type.title.toUpperCase()}</Text>
          <Text style={styles.icon}>{type.icon}</Text>
        </TouchableOpacity>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  icon: {
    fontSize: 20,
    marginLeft: 8,
  },
});

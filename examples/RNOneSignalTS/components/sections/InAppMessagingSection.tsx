import React from 'react';
import { OneSignal } from 'react-native-onesignal';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import { ToggleRow } from '../common/ToggleRow';
import { useAppState } from '../../context/AppStateContext';

interface InAppMessagingSectionProps {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
}

export function InAppMessagingSection({
  loggingFunction,
}: InAppMessagingSectionProps) {
  const { state, dispatch } = useAppState();

  const handleTogglePause = (paused: boolean) => {
    OneSignal.InAppMessages.setPaused(paused);
    loggingFunction(`IAM Paused: ${paused}`);
    dispatch({ type: 'SET_IAM_PAUSED', payload: paused });
  };

  return (
    <Card>
      <SectionHeader title="In-App Messaging" />
      <ToggleRow
        label="Pause IAM"
        value={state.iamPaused}
        onValueChange={handleTogglePause}
      />
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppViewModel } from '../hooks/useAppViewModel';
import { InAppMessageType } from '../models/InAppMessageType';
import TooltipHelper, { TooltipData } from '../services/TooltipHelper';
import LogView from '../components/LogView';
import LoadingOverlay from '../components/LoadingOverlay';
import ActionButton from '../components/ActionButton';
import TooltipModal from '../components/modals/TooltipModal';
import AppSection from '../components/sections/AppSection';
import PushSection from '../components/sections/PushSection';
import SendPushSection from '../components/sections/SendPushSection';
import InAppSection from '../components/sections/InAppSection';
import SendIamSection from '../components/sections/SendIamSection';
import AliasesSection from '../components/sections/AliasesSection';
import EmailsSection from '../components/sections/EmailsSection';
import SmsSection from '../components/sections/SmsSection';
import TagsSection from '../components/sections/TagsSection';
import OutcomesSection from '../components/sections/OutcomesSection';
import TriggersSection from '../components/sections/TriggersSection';
import TrackEventSection from '../components/sections/TrackEventSection';
import LocationSection from '../components/sections/LocationSection';
import { Colors } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const vm = useAppViewModel();
  const { state } = vm;

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  // Auto-request push permission on load
  useEffect(() => {
    vm.promptPush();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showTooltipModal = (key: string) => {
    const tooltip = TooltipHelper.getInstance().getTooltip(key);
    if (tooltip) {
      setActiveTooltip(tooltip);
      setTooltipVisible(true);
    }
  };

  return (
    <View style={styles.root}>
      {/* Sticky Log View */}
      <LogView />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.spacer} />

        <AppSection
          appId={state.appId}
          consentRequired={state.consentRequired}
          privacyConsentGiven={state.privacyConsentGiven}
          externalUserId={state.externalUserId}
          onSetConsentRequired={vm.setConsentRequired}
          onSetConsentGiven={vm.setConsentGiven}
          onLogin={vm.loginUser}
          onLogout={vm.logoutUser}
          onInfoTap={() => showTooltipModal('app')}
        />

        <PushSection
          pushSubscriptionId={state.pushSubscriptionId}
          isPushEnabled={state.isPushEnabled}
          hasNotificationPermission={state.hasNotificationPermission}
          onSetPushEnabled={vm.setPushEnabled}
          onPromptPush={vm.promptPush}
          onInfoTap={() => showTooltipModal('push')}
        />

        <SendPushSection
          onSendNotification={vm.sendNotification}
          onSendCustomNotification={vm.sendCustomNotification}
          onInfoTap={() => showTooltipModal('send_push')}
        />

        <InAppSection
          inAppMessagesPaused={state.inAppMessagesPaused}
          onSetPaused={vm.setIamPaused}
          onInfoTap={() => showTooltipModal('in_app_messaging')}
        />

        <SendIamSection
          onSendIam={(type: InAppMessageType) => vm.sendIamTrigger(type)}
          onInfoTap={() => showTooltipModal('send_iam')}
        />

        <AliasesSection
          aliases={state.aliasesList}
          onAdd={vm.addAlias}
          onAddMultiple={vm.addAliases}
          onInfoTap={() => showTooltipModal('aliases')}
        />

        <EmailsSection
          emails={state.emailsList}
          onAdd={vm.addEmail}
          onRemove={vm.removeEmail}
          onInfoTap={() => showTooltipModal('emails')}
        />

        <SmsSection
          smsNumbers={state.smsNumbersList}
          onAdd={vm.addSms}
          onRemove={vm.removeSms}
          onInfoTap={() => showTooltipModal('sms')}
        />

        <TagsSection
          tags={state.tagsList}
          onAdd={vm.addTag}
          onAddMultiple={vm.addTags}
          onRemoveSelected={vm.removeSelectedTags}
          onInfoTap={() => showTooltipModal('tags')}
        />

        <OutcomesSection
          onSendNormal={vm.sendOutcome}
          onSendUnique={vm.sendUniqueOutcome}
          onSendWithValue={vm.sendOutcomeWithValue}
          onInfoTap={() => showTooltipModal('outcome_events')}
        />

        <TriggersSection
          triggers={state.triggersList}
          onAdd={vm.addTrigger}
          onAddMultiple={vm.addTriggers}
          onRemoveSelected={vm.removeSelectedTriggers}
          onClearAll={vm.clearTriggers}
          onInfoTap={() => showTooltipModal('triggers')}
        />

        <TrackEventSection
          onTrackEvent={vm.trackEvent}
          onInfoTap={() => showTooltipModal('track_event')}
        />

        <LocationSection
          locationShared={state.locationShared}
          onSetLocationShared={vm.setLocationShared}
          onRequestLocationPermission={vm.requestLocationPermission}
          onInfoTap={() => showTooltipModal('location')}
        />

        {/* Next Activity Button */}
        <View style={styles.nextButtonContainer}>
          <ActionButton
            label="NEXT ACTIVITY"
            onPress={() => navigation.navigate('Secondary' as never)}
            testID="next_activity_button"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LoadingOverlay visible={state.isLoading} />

      <TooltipModal
        visible={tooltipVisible}
        tooltip={activeTooltip}
        onClose={() => setTooltipVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
  spacer: {
    height: 16,
  },
  nextButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

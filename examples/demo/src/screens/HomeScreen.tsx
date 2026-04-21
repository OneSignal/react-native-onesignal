import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import TooltipModal from '../components/modals/TooltipModal';
import AliasesSection from '../components/sections/AliasesSection';
import AppSection from '../components/sections/AppSection';
import EmailsSection from '../components/sections/EmailsSection';
import InAppSection from '../components/sections/InAppSection';
import LiveActivitySection from '../components/sections/LiveActivitySection';
import LocationSection from '../components/sections/LocationSection';
import OutcomesSection from '../components/sections/OutcomesSection';
import PushSection from '../components/sections/PushSection';
import SendIamSection from '../components/sections/SendIamSection';
import SendPushSection from '../components/sections/SendPushSection';
import SmsSection from '../components/sections/SmsSection';
import TagsSection from '../components/sections/TagsSection';
import TrackEventSection from '../components/sections/TrackEventSection';
import TriggersSection from '../components/sections/TriggersSection';
import UserSection from '../components/sections/UserSection';
import { useOneSignal } from '../hooks/useOneSignal';
import { InAppMessageType } from '../models/InAppMessageType';
import OneSignalApiService from '../services/OneSignalApiService';
import TooltipHelper, { TooltipData } from '../services/TooltipHelper';
import { AppColors } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const os = useOneSignal();

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    if (os.isReady) os.promptPush();
  }, [os.isReady, os.promptPush]);

  const showTooltipModal = (key: string) => {
    const tooltip = TooltipHelper.getInstance().getTooltip(key);
    if (tooltip) {
      setActiveTooltip(tooltip);
      setTooltipVisible(true);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        testID="main_scroll_view"
      >
        <View style={styles.spacer} />

        <AppSection
          appId={os.appId}
          consentRequired={os.consentRequired}
          privacyConsentGiven={os.privacyConsentGiven}
          onSetConsentRequired={os.setConsentRequired}
          onSetConsentGiven={os.setConsentGiven}
        />

        <UserSection
          externalUserId={os.externalUserId}
          onLogin={os.loginUser}
          onLogout={os.logoutUser}
        />

        <PushSection
          pushSubscriptionId={os.pushSubscriptionId}
          isPushEnabled={os.isPushEnabled}
          hasNotificationPermission={os.hasNotificationPermission}
          onSetPushEnabled={os.setPushEnabled}
          onPromptPush={os.promptPush}
          onInfoTap={() => showTooltipModal('push')}
        />

        <SendPushSection
          onSendNotification={os.sendNotification}
          onSendCustomNotification={os.sendCustomNotification}
          onClearAll={os.clearAllNotifications}
          onInfoTap={() => showTooltipModal('sendPushNotification')}
        />

        <InAppSection
          inAppMessagesPaused={os.inAppMessagesPaused}
          onSetPaused={os.setIamPaused}
          onInfoTap={() => showTooltipModal('inAppMessaging')}
        />

        <SendIamSection
          onSendIam={(type: InAppMessageType) => os.sendIamTrigger(type)}
          onInfoTap={() => showTooltipModal('sendInAppMessage')}
        />

        <AliasesSection
          aliases={os.aliasesList}
          loading={os.isLoading}
          onAdd={os.addAlias}
          onAddMultiple={os.addAliases}
          onInfoTap={() => showTooltipModal('aliases')}
        />

        <EmailsSection
          emails={os.emailsList}
          loading={os.isLoading}
          onAdd={os.addEmail}
          onRemove={os.removeEmail}
          onInfoTap={() => showTooltipModal('emails')}
        />

        <SmsSection
          smsNumbers={os.smsNumbersList}
          loading={os.isLoading}
          onAdd={os.addSms}
          onRemove={os.removeSms}
          onInfoTap={() => showTooltipModal('sms')}
        />

        <TagsSection
          tags={os.tagsList}
          loading={os.isLoading}
          onAdd={os.addTag}
          onAddMultiple={os.addTags}
          onRemoveSelected={os.removeSelectedTags}
          onInfoTap={() => showTooltipModal('tags')}
        />

        <OutcomesSection
          onSendNormal={os.sendOutcome}
          onSendUnique={os.sendUniqueOutcome}
          onSendWithValue={os.sendOutcomeWithValue}
          onInfoTap={() => showTooltipModal('outcomes')}
        />

        <TriggersSection
          triggers={os.triggersList}
          onAdd={os.addTrigger}
          onAddMultiple={os.addTriggers}
          onRemoveSelected={os.removeSelectedTriggers}
          onClearAll={os.clearTriggers}
          onInfoTap={() => showTooltipModal('triggers')}
        />

        <TrackEventSection
          onTrackEvent={os.trackEvent}
          onInfoTap={() => showTooltipModal('trackEvent')}
        />

        <LocationSection
          locationShared={os.locationShared}
          onSetLocationShared={os.setLocationShared}
          onCheckLocationShared={os.checkLocationShared}
          onRequestLocationPermission={os.requestLocationPermission}
          onInfoTap={() => showTooltipModal('location')}
        />

        {Platform.OS === 'ios' && (
          <LiveActivitySection
            hasApiKey={OneSignalApiService.getInstance().hasApiKey()}
            onStart={os.startDefaultLiveActivity}
            onUpdate={os.updateLiveActivity}
            onEnd={os.endLiveActivity}
            onInfoTap={() => showTooltipModal('liveActivities')}
          />
        )}

        {/* Next Activity Button */}
        <View style={styles.nextButtonContainer}>
          <ActionButton
            label="NEXT SCREEN"
            onPress={() => navigation.navigate('Secondary' as never)}
            testID="next_screen_button"
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

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
    backgroundColor: AppColors.osLightBackground,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
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

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import { InAppMessageType } from '../models/InAppMessageType';
import TooltipHelper, { TooltipData } from '../services/TooltipHelper';
import LogView from '../components/LogView';
import LoadingOverlay from '../components/LoadingOverlay';
import ActionButton from '../components/ActionButton';
import SectionCard from '../components/SectionCard';
import TooltipModal from '../components/modals/TooltipModal';
import LoginModal from '../components/modals/LoginModal';
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
import { AppTheme, Colors, Spacing } from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const app = useAppContext();
  const { state } = app;

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);
  const [loginVisible, setLoginVisible] = useState(false);

  const isLoggedIn = !!state.externalUserId;

  // Auto-request push permission on load
  useEffect(() => {
    app.promptPush();
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
          onSetConsentRequired={app.setConsentRequired}
          onSetConsentGiven={app.setConsentGiven}
        />

        <SectionCard title="User">
          <View style={[AppTheme.card, styles.userCard]}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text
                style={[styles.statusValue, isLoggedIn && styles.loggedInText]}
              >
                {isLoggedIn ? 'Logged In' : 'Anonymous'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>External ID</Text>
              <Text style={styles.statusValue} numberOfLines={1}>
                {state.externalUserId ?? '–'}
              </Text>
            </View>
          </View>
          <ActionButton
            label={isLoggedIn ? 'SWITCH USER' : 'LOGIN USER'}
            onPress={() => setLoginVisible(true)}
            testID="login_user_button"
          />
          {isLoggedIn && (
            <ActionButton
              label="LOGOUT USER"
              onPress={app.logoutUser}
              variant="outlined"
              testID="logout_user_button"
            />
          )}
          <LoginModal
            visible={loginVisible}
            isLoggedIn={isLoggedIn}
            onConfirm={app.loginUser}
            onClose={() => setLoginVisible(false)}
          />
        </SectionCard>

        <PushSection
          pushSubscriptionId={state.pushSubscriptionId}
          isPushEnabled={state.isPushEnabled}
          hasNotificationPermission={state.hasNotificationPermission}
          onSetPushEnabled={app.setPushEnabled}
          onPromptPush={app.promptPush}
          onInfoTap={() => showTooltipModal('push')}
        />

        <SendPushSection
          onSendNotification={app.sendNotification}
          onSendCustomNotification={app.sendCustomNotification}
          onInfoTap={() => showTooltipModal('send_push')}
        />

        <InAppSection
          inAppMessagesPaused={state.inAppMessagesPaused}
          onSetPaused={app.setIamPaused}
          onInfoTap={() => showTooltipModal('in_app_messaging')}
        />

        <SendIamSection
          onSendIam={(type: InAppMessageType) => app.sendIamTrigger(type)}
          onInfoTap={() => showTooltipModal('send_iam')}
        />

        <AliasesSection
          aliases={state.aliasesList}
          onAdd={app.addAlias}
          onAddMultiple={app.addAliases}
          onInfoTap={() => showTooltipModal('aliases')}
        />

        <EmailsSection
          emails={state.emailsList}
          onAdd={app.addEmail}
          onRemove={app.removeEmail}
          onInfoTap={() => showTooltipModal('emails')}
        />

        <SmsSection
          smsNumbers={state.smsNumbersList}
          onAdd={app.addSms}
          onRemove={app.removeSms}
          onInfoTap={() => showTooltipModal('sms')}
        />

        <TagsSection
          tags={state.tagsList}
          onAdd={app.addTag}
          onAddMultiple={app.addTags}
          onRemoveSelected={app.removeSelectedTags}
          onInfoTap={() => showTooltipModal('tags')}
        />

        <OutcomesSection
          onSendNormal={app.sendOutcome}
          onSendUnique={app.sendUniqueOutcome}
          onSendWithValue={app.sendOutcomeWithValue}
          onInfoTap={() => showTooltipModal('outcome_events')}
        />

        <TriggersSection
          triggers={state.triggersList}
          onAdd={app.addTrigger}
          onAddMultiple={app.addTriggers}
          onRemoveSelected={app.removeSelectedTriggers}
          onClearAll={app.clearTriggers}
          onInfoTap={() => showTooltipModal('triggers')}
        />

        <TrackEventSection
          onTrackEvent={app.trackEvent}
          onInfoTap={() => showTooltipModal('track_event')}
        />

        <LocationSection
          locationShared={state.locationShared}
          onSetLocationShared={app.setLocationShared}
          onRequestLocationPermission={app.requestLocationPermission}
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
  userCard: {
    marginBottom: Spacing.cardGap,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  loggedInText: {
    color: '#2E7D32',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dividerColor,
    marginVertical: 8,
  },
});

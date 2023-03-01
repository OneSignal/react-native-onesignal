import {OneSignal, OutcomeEvent} from 'react-native-onesignal';
import * as React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {renderButtonView} from './Helpers';
import {Text, Divider} from "@react-native-material/core";

export interface Props {
    loggingFunction: Function;
    inputFieldValue: string;
}

class OSButtons extends React.Component<Props> {
    createInAppMessagesFields() {
        const {loggingFunction} = this.props;

        const getPausedButton = renderButtonView(
            'Get paused',
            async () => {
                const paused = await OneSignal.InAppMessages.getPaused();
                loggingFunction(`Is IAM Paused: ${paused}`);
            }
        );

        const pauseIamButton = renderButtonView(
            'Pause IAM',
            () => {
                OneSignal.InAppMessages.setPaused(true);
                loggingFunction('IAM Paused: true');
            }
        );

        const unPauseIamButton = renderButtonView(
            'Unpause IAM',
            () => {
                OneSignal.InAppMessages.setPaused(false);
                loggingFunction('IAM Paused: true');
            }
        );

        const removeTriggerButton = renderButtonView(
            'Remove trigger for key',
            () => {
                const key = this.props.inputFieldValue;
                loggingFunction('Removing trigger for key: ', key);
                OneSignal.InAppMessages.removeTrigger(key);
            }
        );
        
        const addTriggerButton = renderButtonView(
            'Add trigger with key my_trigger',
            () => {
                const triggerValue = this.props.inputFieldValue;
                loggingFunction(`Adding trigger with key 'my_trigger' and value ${triggerValue}`);
                OneSignal.InAppMessages.addTrigger('my_trigger', triggerValue);
            }
        );

        const addTriggersButton = renderButtonView(
            'Add list of test triggers',
            () => {
                loggingFunction('Adding a list of test triggers');
                OneSignal.User.addAliases({
                    'my_trigger_1': 'my_trigger_1_value',
                    'my_trigger_2': 'my_trigger_2_value',
                    'my_trigger_3': 'my_trigger_3_value', 
                });
            }
        );

        const removeTriggersButton = renderButtonView(
            'Remove list of test triggers',
            () => {
                loggingFunction('Removing list of test triggers');
                OneSignal.User.removeAliases(['my_trigger_1', 'my_trigger_2', 'my_trigger_3']);
            }
        );

        const clearAllTriggersButton = renderButtonView(
            'Clear all triggers',
            () => {
                const triggerValue = this.props.inputFieldValue;
                loggingFunction(`Clearing all triggers`);
                OneSignal.InAppMessages.clearTriggers();
            }
        );

        return [
            getPausedButton,
            pauseIamButton, 
            unPauseIamButton,
            addTriggerButton, 
            removeTriggerButton,
            addTriggersButton,
            removeTriggersButton,
            clearAllTriggersButton,
        ];
    }

    createLocationFields() {
        const {loggingFunction} = this.props;
        const locationShared = renderButtonView(
            'Is Location Shared',
            async () => {
                const isLocationShared = await OneSignal.Location.isShared();
                loggingFunction(`Application has location shared active: ${isLocationShared}`);
            });

        const setLocationShared = renderButtonView(
            'Share Location',
            () => {
                loggingFunction('Sharing location');
                OneSignal.Location.setShared(true);
                
            }
        );

        const setLocationUnshared = renderButtonView(
            'Unshare Location',
            () => {
                loggingFunction('Unsharing location');
                OneSignal.Location.setShared(false);
            }
        );

        const requestPermissionButton = renderButtonView(
            'Request Location Permission',
            () => {
                loggingFunction('Request Location permission');
                OneSignal.Location.requestPermission();
            }
        );

        return [
            locationShared, 
            setLocationShared, 
            setLocationUnshared, 
            requestPermissionButton
        ];
    }

    createNotificationFields() {
        const {loggingFunction} = this.props;

        const hasPermissionButton = renderButtonView(
            'Has Notification Permission',
            async () => {
                const granted = await OneSignal.Notifications.hasPermission();
                loggingFunction(`Has Notification Permission: ${granted}`);
            }
        );

        const canRequestPermissionButton = renderButtonView(
            'Can Request Permission',
            async () => {
                const granted = await OneSignal.Notifications.canRequestPermission();
                loggingFunction(`Can Request Permission: ${granted}`);
            }
        );

        const requestPermissionButton = renderButtonView(
            'Request Permission',
            async () => {
                loggingFunction('Requesting notification permission');
                OneSignal.Notifications.requestPermission();
            }
        );

        const requestProvisionalPermissionButton = renderButtonView(
            'Register For Provisional Authorization',
            () => {
                loggingFunction('Requesting provisional notification permission:');

                OneSignal.Notifications.registerForProvisionalAuthorization(response => {
                    loggingFunction(`User response: ${response}`);
                });
            }
        );

        const clearOneSignalNotificationsButton = renderButtonView(
            'Clear OneSignal Notifications',
            () => {
                loggingFunction('Clearing all OneSignal Notifications');
                OneSignal.Notifications.clearAll();
            }
        );

        return [
            hasPermissionButton,
            canRequestPermissionButton,
            requestPermissionButton,
            requestProvisionalPermissionButton,
            clearOneSignalNotificationsButton
        ];
    }

    createSessionFields() {
        const {loggingFunction} = this.props;

        const sendOutcomeButton = renderButtonView(
            'Send Outcome With Name',
            () => {
                loggingFunction('Sending outcome: ', this.props.inputFieldValue);
                OneSignal.Session.addOutcome(this.props.inputFieldValue);
            }
        );

        const sendUniqueOutcomeButton = renderButtonView(
            'Send Unique Outcome With Name',
            () => {
                loggingFunction('Sending unique outcome: ', this.props.inputFieldValue);
                OneSignal.Session.addUniqueOutcome(this.props.inputFieldValue);
            }
        );

        const sendOutcomeWithValueButton = renderButtonView(
            'Send "my_outcome" with value',
            () => {
                const value = Number(this.props.inputFieldValue);
                loggingFunction('Sending outcome of name "my_outcome" with value: ', value);

                if (Number.isNaN(value)) {
                    console.error('Outcome with value should be a number');
                    return;
                }
                OneSignal.Session.addOutcomeWithValue('my_outcome', value);
            }
        );

        return [sendOutcomeButton, sendUniqueOutcomeButton, sendOutcomeWithValueButton];
    }

    createUserFields() {
        const {loggingFunction} = this.props;

        const addEmailButton = renderButtonView(
            'Add Email',
            () => {
                loggingFunction('Attempting to set email: ', this.props.inputFieldValue);
                OneSignal.User.addEmail(this.props.inputFieldValue);
            }
        );

        const removeEmailButton = renderButtonView(
            'Remove Email',
            () => {
                loggingFunction('Attempting to remove email: ', this.props.inputFieldValue);
                OneSignal.User.removeEmail(this.props.inputFieldValue);
            }
        );

        const loginButton = renderButtonView(
            'Login',
            () => {
                loggingFunction('Attempting to login a user: ', this.props.inputFieldValue);
                OneSignal.login(this.props.inputFieldValue);
            }
        )

        const logoutButton = renderButtonView(
            'Logout',
            () => {
                loggingFunction('Attempting to logout a user: ');
                OneSignal.logout();
            }
        )

        const sendTagWithKeyButton = renderButtonView(
            'Send tag with key my_tag',
            async () => {
                loggingFunction('Sending tag with value: ', this.props.inputFieldValue);
                OneSignal.User.addTag('my_tag', this.props.inputFieldValue);
            }
        );

        const deleteTagWithKeyButton = renderButtonView(
            'Delete Tag With Key',
            async () => {
                loggingFunction('Deleting tag with key: ', this.props.inputFieldValue);
                OneSignal.User.removeTag(this.props.inputFieldValue);
            }
        );

        const addTagsButton = renderButtonView(
            'Add list of tags',
            () => {
                loggingFunction('Adding list of tags');
                OneSignal.User.addTags({'my_tag1': 'my_value', 'my_tag2': 'my_value2'});
            }
        );

        const removeTagsButton = renderButtonView(
            'Remove list of tags',
            () => {
                loggingFunction('Removing list of tags');
                OneSignal.User.removeTags(['my_tag1', 'my_tag2']);
            }
        );

        const setLanguageButton = renderButtonView(
            'Set Language',
            () => {
                loggingFunction('Attempting to set language: ', this.props.inputFieldValue);
                OneSignal.User.setLanguage(this.props.inputFieldValue);
            }
        );

        const addSmsButton = renderButtonView(
            'Set SMS Number',
            () => {
                loggingFunction('Attempting to set SMS number: ', this.props.inputFieldValue);
                OneSignal.User.addSms(this.props.inputFieldValue,);
            }
        );

        const removeSmsButton = renderButtonView(
            'Logout SMS Number',
            () => {
                loggingFunction('Attempting to remove SMS number: ', this.props.inputFieldValue);
                OneSignal.User.removeSms(this.props.inputFieldValue);
            }
        );

        const addAliasButton = renderButtonView(
            'Add my_alias with value',
            () => {
                loggingFunction('Adding my_alias alias with value: ', this.props.inputFieldValue);
                OneSignal.User.addAlias('my_alias', this.props.inputFieldValue);
            }
        );

        const removeAliasButton = renderButtonView(
            'Remove my_alias',
            () => {
                loggingFunction('Removing my_alias');
                OneSignal.User.removeAlias('my_alias');
            }
        );

        const addAliasesButton = renderButtonView(
            'Add list of test aliases',
            () => {
                loggingFunction('Adding a list of test aliases ');
                OneSignal.User.addAliases({
                    'my_alias_1': 'my_alias_1_id',
                    'my_alias_2': 'my_alias_2_id',
                    'my_alias_3': 'my_alias_3_id', 
                });
            }
        );

        const removeAliasesButton = renderButtonView(
            'Remove list of test aliases',
            () => {
                loggingFunction('Removing list of test aliases');
                OneSignal.User.removeAliases(['my_alias_1', 'my_alias_2', 'my_alias_3']);
            }
        );

        return [
            loginButton,
            logoutButton,
            addEmailButton,
            removeEmailButton,
            sendTagWithKeyButton,
            deleteTagWithKeyButton,
            addTagsButton,
            removeTagsButton,
            setLanguageButton,
            addSmsButton,
            removeSmsButton,
            addAliasButton,
            removeAliasButton,
            addAliasesButton,
            removeAliasesButton,
        ];
    }

    pushSubscriptionFields() {
        const {loggingFunction} = this.props;

        const getPushSubscriptionIdButton = renderButtonView(
            'Get Push Subscription Id',
            async () => {
                const id = await OneSignal.User.PushSubscription.getPushSubscriptionId();
                loggingFunction('Push Subscription Id: ', id);
            }
        );

        const getPushSubscriptionTokenButton = renderButtonView(
            'Get Push Subscription Token',
            async () => {
                const token = await OneSignal.User.PushSubscription.getPushSubscriptionToken();
                loggingFunction('Push Subscription Id: ', token);
            }
        );

        const getOptedInButton = renderButtonView(
            'Is Opted In',
            async () => {
                const optedIn = await OneSignal.User.PushSubscription.getOptedIn();
                loggingFunction('Subscribed for the push notifications: ', optedIn);
            }
        );

        const optInButton = renderButtonView(
            'Opt In',
            () => {
                loggingFunction('Subscribing for the push notifications');
                OneSignal.User.PushSubscription.optIn();
            }
        );

        const optOutButton = renderButtonView(
            'Opt Out',
            () => {
                loggingFunction('Unsubscribing from the push notifications');
                OneSignal.User.PushSubscription.optOut();
            }
        );

        return [
            getPushSubscriptionIdButton,
            getPushSubscriptionTokenButton,
            getOptedInButton,
            optInButton,
            optOutButton,
        ];
    }

    privacyConsentFields() {
        const {loggingFunction} = this.props;

        const getPrivacyConsentButton = renderButtonView(
            'Get Privacy Consent',
            async () => {
                const granted = await OneSignal.getPrivacyConsent();
                loggingFunction('Privacy consent granted: ', granted);
            }
        );

        const setPrivacyConsentTrueButton = renderButtonView(
            'Set Privacy Consent to true',
            async () => {
                await OneSignal.setPrivacyConsent(true);
                loggingFunction('Privacy Consent set to true');
            }
        );

        const setPrivacyConsentFalseButton = renderButtonView(
            'Set Privacy Consent to false',
            async () => {
                await OneSignal.setPrivacyConsent(false);
                loggingFunction('Privacy Consent set to false');
            }
        );

        const getRequiresPrivacyConsentButton = renderButtonView(
            'Get Requires Privacy Consent',
            async () => {
                const granted = await OneSignal.getRequiresPrivacyConsent();
                loggingFunction('Requires Privacy Consent: ', granted);
            }
        );

        const setRequiresPrivacyConsentTrueButton = renderButtonView(
            'Set Requiers Privacy Consent to true',
            async () => {
                await OneSignal.setRequiresPrivacyConsent(true);
                loggingFunction('Requires Privacy Consent set to true');
            }
        );
        
        const setRequiresPrivacyConsentFalseButton = renderButtonView(
            'Set Requiers Privacy Consent to false',
            async () => {
                await OneSignal.setRequiresPrivacyConsent(false);
                loggingFunction('Requires Privacy Consent set to false');
            }
        );
        
        return [
            getPrivacyConsentButton,
            setPrivacyConsentTrueButton,
            setPrivacyConsentFalseButton,
            getRequiresPrivacyConsentButton,
            setRequiresPrivacyConsentTrueButton,
            setRequiresPrivacyConsentFalseButton,
        ];
    }

    render() {
        return (
            <View>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">InAppMessages</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.createInAppMessagesFields() }

                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">Location</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.createLocationFields() }

                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">Notifications</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.createNotificationFields() }
                
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">Session</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.createSessionFields() }

                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">User</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.createUserFields() }

                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">Push Subscription</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.pushSubscriptionFields() }

                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                <Text variant="h5">Privacy Consent</Text>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
                { this.privacyConsentFields() }
            </View>
        );
    }
};

const styles = StyleSheet.create({
  greeting: {
    color: '#999',
    fontWeight: 'bold'
  }
});

export default OSButtons;

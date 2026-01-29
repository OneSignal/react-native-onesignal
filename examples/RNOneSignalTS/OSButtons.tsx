import React from 'react';
import { Platform, Text, View } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import { renderButtonView } from './Helpers';
// Remove: import {Text, Divider} from '@react-native-material/core';

export interface Props {
  loggingFunction: (message: string, optionalArg?: unknown) => void;
  inputFieldValue: string;
}

const OSButtons: React.FC<Props> = ({ loggingFunction, inputFieldValue }) => {
  const createInAppMessagesFields = () => {
    const getPausedButton = renderButtonView('Get paused', async () => {
      const paused = await OneSignal.InAppMessages.getPaused();
      loggingFunction(`Is IAM Paused: ${paused}`);
    });

    const pauseIamButton = renderButtonView('Pause IAM', () => {
      OneSignal.InAppMessages.setPaused(true);
      loggingFunction('IAM Paused: true');
    });

    const unPauseIamButton = renderButtonView('Unpause IAM', () => {
      OneSignal.InAppMessages.setPaused(false);
      loggingFunction('IAM Paused: false');
    });

    const removeTriggerButton = renderButtonView(
      'Remove trigger for key',
      () => {
        const key = inputFieldValue;
        loggingFunction('Removing trigger for key: ', key);
        OneSignal.InAppMessages.removeTrigger(key);
      },
    );

    const addTriggerButton = renderButtonView(
      'Add trigger with key my_trigger',
      () => {
        const triggerValue = inputFieldValue;
        loggingFunction(
          `Adding trigger with key 'my_trigger' and value ${triggerValue}`,
        );
        OneSignal.InAppMessages.addTrigger('my_trigger', triggerValue);
      },
    );

    const addTriggersButton = renderButtonView(
      'Add list of test triggers',
      () => {
        loggingFunction('Adding a list of test triggers');
        OneSignal.InAppMessages.addTriggers({
          my_trigger_1: 'my_trigger_1_value',
          my_trigger_2: 'my_trigger_2_value',
          my_trigger_3: 'my_trigger_3_value',
        });
      },
    );

    const removeTriggersButton = renderButtonView(
      'Remove list of test triggers',
      () => {
        loggingFunction('Removing list of test triggers');
        OneSignal.InAppMessages.removeTriggers([
          'my_trigger_1',
          'my_trigger_2',
          'my_trigger_3',
        ]);
      },
    );

    const clearAllTriggersButton = renderButtonView(
      'Clear all triggers',
      () => {
        loggingFunction(`Clearing all triggers`);
        OneSignal.InAppMessages.clearTriggers();
      },
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
  };

  const createLocationFields = () => {
    const locationShared = renderButtonView('Is Location Shared', async () => {
      const isLocationShared = await OneSignal.Location.isShared();
      loggingFunction(
        `Application has location shared active: ${isLocationShared}`,
      );
    });

    const setLocationShared = renderButtonView('Share Location', () => {
      loggingFunction('Sharing location');
      OneSignal.Location.setShared(true);
    });

    const setLocationUnshared = renderButtonView('Unshare Location', () => {
      loggingFunction('Unsharing location');
      OneSignal.Location.setShared(false);
    });

    const requestPermissionButton = renderButtonView(
      'Request Location Permission',
      () => {
        loggingFunction('Request Location permission');
        OneSignal.Location.requestPermission();
      },
    );

    return [
      locationShared,
      setLocationShared,
      setLocationUnshared,
      requestPermissionButton,
    ];
  };

  const createNotificationFields = () => {
    const hasPermissionButton = renderButtonView(
      'Has Notification Permission',
      async () => {
        const granted = await OneSignal.Notifications.getPermissionAsync();
        loggingFunction(`Has Notification Permission: ${granted}`);
      },
    );

    const permissionNativeButton = renderButtonView(
      'Permission Native',
      async () => {
        const granted = await OneSignal.Notifications.permissionNative();
        loggingFunction(`Permission Native: ${granted}`);
      },
    );

    const canRequestPermissionButton = renderButtonView(
      'Can Request Permission',
      async () => {
        const granted = await OneSignal.Notifications.canRequestPermission();
        loggingFunction(`Can Request Permission: ${granted}`);
      },
    );

    const requestPermissionButton = renderButtonView(
      'Request Permission',
      async () => {
        loggingFunction('Requesting notification permission');
        const granted = await OneSignal.Notifications.requestPermission(false);
        loggingFunction(`Notification permission granted ${granted}`);
      },
    );

    const clearOneSignalNotificationsButton = renderButtonView(
      'Clear OneSignal Notifications',
      () => {
        loggingFunction('Clearing all OneSignal Notifications');
        OneSignal.Notifications.clearAll();
      },
    );

    return [
      hasPermissionButton,
      permissionNativeButton,
      canRequestPermissionButton,
      requestPermissionButton,
      clearOneSignalNotificationsButton,
    ];
  };

  const createLiveActivitiesFields = () => {
    const startDefaultLiveActivity = renderButtonView(
      'Start Default Live Activity',
      async () => {
        loggingFunction('Starting live activity');
        await OneSignal.LiveActivities.startDefault(
          inputFieldValue,
          { title: 'Welcome!' },
          {
            message: { en: 'Hello World!' },
            intValue: 3,
            doubleValue: 3.14,
            boolValue: true,
          },
        );
        loggingFunction('Live Activity started');
      },
    );

    // In a real app the below methods would call a bridge to perform a live
    // activity function, the data then passed back to RN, and subsequently
    // passed over to the OneSignal SDK.
    const enterLiveActivity = renderButtonView(
      'Enter Live Activity',
      async () => {
        loggingFunction('Entering live activity');
        await OneSignal.LiveActivities.enter(inputFieldValue, 'FAKE_TOKEN');
      },
    );

    const exitLiveActivity = renderButtonView(
      'Exit Live Activity',
      async () => {
        loggingFunction('Exiting live activity');
        await OneSignal.LiveActivities.exit(inputFieldValue);
      },
    );

    const setPushToStartLiveActivity = renderButtonView(
      'Set Push-To-Start Live Activity',
      async () => {
        loggingFunction('Set pushToStart token');
        await OneSignal.LiveActivities.setPushToStartToken(
          inputFieldValue,
          'FAKE_TOKEN',
        );
      },
    );

    const removePushToStartLiveActivity = renderButtonView(
      'Remove Push-To-Start Live Activity',
      async () => {
        loggingFunction('Remove pushToStart token');
        await OneSignal.LiveActivities.removePushToStartToken(inputFieldValue);
      },
    );

    return [
      startDefaultLiveActivity,
      enterLiveActivity,
      exitLiveActivity,
      setPushToStartLiveActivity,
      removePushToStartLiveActivity,
    ];
  };

  const createSessionFields = () => {
    const sendOutcomeButton = renderButtonView('Send Outcome With Name', () => {
      loggingFunction('Sending outcome: ', inputFieldValue);
      OneSignal.Session.addOutcome(inputFieldValue);
    });

    const sendUniqueOutcomeButton = renderButtonView(
      'Send Unique Outcome With Name',
      () => {
        loggingFunction('Sending unique outcome: ', inputFieldValue);
        OneSignal.Session.addUniqueOutcome(inputFieldValue);
      },
    );

    const sendOutcomeWithValueButton = renderButtonView(
      'Send "my_outcome" with value',
      () => {
        const value = Number(inputFieldValue);
        loggingFunction(
          'Sending outcome of name "my_outcome" with value: ',
          value,
        );

        if (Number.isNaN(value)) {
          console.error('Outcome with value should be a number');
          return;
        }
        OneSignal.Session.addOutcomeWithValue('my_outcome', value);
      },
    );

    return [
      sendOutcomeButton,
      sendUniqueOutcomeButton,
      sendOutcomeWithValueButton,
    ];
  };

  const createUserFields = () => {
    const addEmailButton = renderButtonView('Add Email', () => {
      loggingFunction('Attempting to set email: ', inputFieldValue);
      OneSignal.User.addEmail(inputFieldValue);
    });

    const removeEmailButton = renderButtonView('Remove Email', () => {
      loggingFunction('Attempting to remove email: ', inputFieldValue);
      OneSignal.User.removeEmail(inputFieldValue);
    });

    const loginButton = renderButtonView('Login', () => {
      loggingFunction('Attempting to login a user: ', inputFieldValue);
      OneSignal.login(inputFieldValue);
    });

    const logoutButton = renderButtonView('Logout', () => {
      loggingFunction('Attempting to logout a user: ');
      OneSignal.logout();
    });

    const sendTagWithKeyButton = renderButtonView(
      'Send tag with key my_tag',
      async () => {
        loggingFunction('Sending tag with value: ', inputFieldValue);
        OneSignal.User.addTag('my_tag', inputFieldValue);
      },
    );

    const deleteTagWithKeyButton = renderButtonView(
      'Delete Tag With Key',
      async () => {
        loggingFunction('Deleting tag with key: ', inputFieldValue);
        OneSignal.User.removeTag(inputFieldValue);
      },
    );

    const addTagsButton = renderButtonView('Add list of tags', () => {
      loggingFunction('Adding list of tags');
      OneSignal.User.addTags({ my_tag1: 'my_value', my_tag2: 'my_value2' });
    });

    const removeTagsButton = renderButtonView('Remove list of tags', () => {
      loggingFunction('Removing list of tags');
      OneSignal.User.removeTags(['my_tag1', 'my_tag2']);
    });

    const getTagsButton = renderButtonView('Get tags', async () => {
      const tags = await OneSignal.User.getTags();
      loggingFunction('Tags:', tags);
    });

    const setLanguageButton = renderButtonView('Set Language', () => {
      loggingFunction('Attempting to set language: ', inputFieldValue);
      OneSignal.User.setLanguage(inputFieldValue);
    });

    const addSmsButton = renderButtonView('Set SMS Number', () => {
      loggingFunction('Attempting to set SMS number: ', inputFieldValue);
      OneSignal.User.addSms(inputFieldValue);
    });

    const removeSmsButton = renderButtonView('Logout SMS Number', () => {
      loggingFunction('Attempting to remove SMS number: ', inputFieldValue);
      OneSignal.User.removeSms(inputFieldValue);
    });

    const addAliasButton = renderButtonView('Add my_alias with value', () => {
      loggingFunction('Adding my_alias alias with value: ', inputFieldValue);
      OneSignal.User.addAlias('my_alias', inputFieldValue);
    });

    const removeAliasButton = renderButtonView('Remove my_alias', () => {
      loggingFunction('Removing my_alias');
      OneSignal.User.removeAlias('my_alias');
    });

    const addAliasesButton = renderButtonView(
      'Add list of test aliases',
      () => {
        loggingFunction('Adding a list of test aliases ');
        OneSignal.User.addAliases({
          my_alias_1: 'my_alias_1_id',
          my_alias_2: 'my_alias_2_id',
          my_alias_3: 'my_alias_3_id',
        });
      },
    );

    const removeAliasesButton = renderButtonView(
      'Remove list of test aliases',
      () => {
        loggingFunction('Removing list of test aliases');
        OneSignal.User.removeAliases([
          'my_alias_1',
          'my_alias_2',
          'my_alias_3',
        ]);
      },
    );

    const getOnesignalIdButton = renderButtonView(
      'Get OneSignal Id',
      async () => {
        const onesignalId = await OneSignal.User.getOnesignalId();
        loggingFunction('OneSignal Id: ', onesignalId);
      },
    );

    const getExternalIdButton = renderButtonView(
      'Get External Id',
      async () => {
        const externalId = await OneSignal.User.getExternalId();
        loggingFunction('External Id:', externalId);
      },
    );

    const trackEventButton = renderButtonView('Track Event', () => {
      loggingFunction('Tracking event: ', 'ReactNative');
      const platform = Platform.OS; // This will be 'ios' or 'android'
      OneSignal.User.trackEvent(`ReactNative-${platform}-noprops`);
      OneSignal.User.trackEvent(`ReactNative-${platform}`, {
        someNum: 123,
        someFloat: 3.14159,
        someString: 'abc',
        someBool: true,
        someObject: {
          abc: '123',
          nested: {
            def: '456',
          },
          ghi: null,
        },
        someArray: [1, 2],
        someMixedArray: [1, '2', { abc: '123' }, null],
        someNull: null,
      });
    });

    return [
      loginButton,
      logoutButton,
      addEmailButton,
      removeEmailButton,
      trackEventButton,
      sendTagWithKeyButton,
      deleteTagWithKeyButton,
      addTagsButton,
      removeTagsButton,
      getTagsButton,
      setLanguageButton,
      addSmsButton,
      removeSmsButton,
      addAliasButton,
      removeAliasButton,
      addAliasesButton,
      removeAliasesButton,
      getOnesignalIdButton,
      getExternalIdButton,
    ];
  };

  const pushSubscriptionFields = () => {
    const getPushSubscriptionIdButton = renderButtonView(
      'Get Push Subscription Id',
      async () => {
        const id = await OneSignal.User.pushSubscription.getIdAsync();
        loggingFunction('Push Subscription Id: ', id);
      },
    );

    const getPushSubscriptionTokenButton = renderButtonView(
      'Get Push Subscription Token',
      async () => {
        const token = await OneSignal.User.pushSubscription.getTokenAsync();
        loggingFunction('Push Subscription Token: ', token);
      },
    );

    const getOptedInButton = renderButtonView('Is Opted In', async () => {
      const optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
      loggingFunction('Subscribed for the push notifications: ', optedIn);
    });

    const optInButton = renderButtonView('Opt In', () => {
      loggingFunction('Subscribing for the push notifications');
      OneSignal.User.pushSubscription.optIn();
    });

    const optOutButton = renderButtonView('Opt Out', () => {
      loggingFunction('Unsubscribing from the push notifications');
      OneSignal.User.pushSubscription.optOut();
    });

    return [
      getPushSubscriptionIdButton,
      getPushSubscriptionTokenButton,
      getOptedInButton,
      optInButton,
      optOutButton,
    ];
  };

  const privacyConsentFields = () => {
    const setPrivacyConsentGivenTrueButton = renderButtonView(
      'Set Privacy Consent to true',
      async () => {
        await OneSignal.setConsentGiven(true);
        loggingFunction('Privacy Consent set to true');
      },
    );

    const setPrivacyConsentGivenFalseButton = renderButtonView(
      'Set Privacy Consent to false',
      async () => {
        await OneSignal.setConsentGiven(false);
        loggingFunction('Privacy Consent set to false');
      },
    );

    const setPrivacyConsentRequiredTrueButton = renderButtonView(
      'Set Requiers Privacy Consent to true',
      async () => {
        await OneSignal.setConsentRequired(true);
        loggingFunction('Requires Privacy Consent set to true');
      },
    );

    const setPrivacyConsentRequiredFalseButton = renderButtonView(
      'Set Requiers Privacy Consent to false',
      async () => {
        await OneSignal.setConsentRequired(false);
        loggingFunction('Requires Privacy Consent set to false');
      },
    );

    return [
      setPrivacyConsentGivenTrueButton,
      setPrivacyConsentGivenFalseButton,
      setPrivacyConsentRequiredTrueButton,
      setPrivacyConsentRequiredFalseButton,
    ];
  };

  return (
    <View>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>InAppMessages</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {createInAppMessagesFields()}

      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Location</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {createLocationFields()}

      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Notifications</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {createNotificationFields()}

      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Live Activities</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {createLiveActivitiesFields()}

      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Session</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {createSessionFields()}

      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>User</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {createUserFields()}

      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
        Push Subscription
      </Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {pushSubscriptionFields()}

      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Privacy Consent</Text>
      <View
        style={{ height: 1, backgroundColor: '#ccc', marginVertical: 10 }}
      />
      {privacyConsentFields()}
    </View>
  );
};

export default OSButtons;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    TextInput,
    Image,
    Button,
} from 'react-native';
import OneSignal from 'react-native-onesignal';
import { sleep } from './Util';

const imageUri = 'https://cdn-images-1.medium.com/max/300/1*7xHdCFeYfD8zrIivMiQcCQ.png';
const buttonColor = Platform.OS == 'ios' ? '#3C8AE7' : '#D45653';
const textInputBorderColor = Platform.OS == 'ios' ? '#3C8AE7' : '#D45653';
const disabledColor = '#BEBEBE';

/**
 Change to desired app id (dashboard app)
 */
var appId = '77e32082-ea27-42e3-a898-c72e141824ef';

/**
 Controls whether the app needs privacy consent or not
 Will hide the button when false and show it when true
 */
var requiresPrivacyConsent = true;

export default class App extends Component {

    constructor(properties) {
        super(properties);

        this.state = {
            // OneSignal states
            // Privacy Consent states
            hasPrivacyConsent: false, // App starts without privacy consent
            isPrivacyConsentLoading: requiresPrivacyConsent,

            // Device states
            userId: '',
            pushToken: '',

            // Subscription states
            isSubscribed: false,
            isSubscriptionLoading: false,

            // External User Id states
            externalUserId: '',
            isExternalUserIdLoading: false,

            // Email states
            email: '',
            isEmailLoading: false,

            // In-App Messaging states
            iam_paused: false,

            // Add more states here...

            // Demo App states
            debugText: ''
        };

        // Log level logcat is 6 (VERBOSE) and log level alert is 0 (NONE)
        OneSignal.setLogLevel(6, 0);

        // Share location of device
        OneSignal.setLocationShared(true);

        OneSignal.setRequiresUserPrivacyConsent(requiresPrivacyConsent);
        OneSignal.init(appId, {
            kOSSettingsKeyAutoPrompt: true,
        });

        // Notifications will display as NOTIFICATION type
        OneSignal.inFocusDisplaying(2);

        // If the app requires privacy consent check if it has been set yet
        if (requiresPrivacyConsent) {
        // async 'then' is only so I can sleep using the Promise helper method
            OneSignal.userProvidedPrivacyConsent().then(async (granted) => {
                // For UI testing purposes wait X seconds to see the loading state
                await sleep(0);

                console.log('Privacy Consent status: ' + granted);
                this.setState({hasPrivacyConsent:granted, isPrivacyConsentLoading:false});
            });
        }

        OneSignal.getPermissionSubscriptionState((response) => {
            console.log('Device state:');
            console.log(response);

            let notificationsEnabled = response['notificationsEnabled'];
            let isSubscribed = response['subscriptionEnabled'];

            this.setState({isSubscribed:notificationsEnabled && isSubscribed, isSubscriptionLoading:false}, () => {
                OneSignal.setSubscription(isSubscribed);
            });
        });

        // Examples for using native IAM public methods
//        this.oneSignalInAppMessagingExamples();

        // Examples for using native Outcome Event public methods
//        this.oneSignalOutcomeEventsExamples();

    }

    async componentDidMount() {
        OneSignal.addEventListener('received', this.onNotificationReceived);
        OneSignal.addEventListener('opened', this.onNotificationOpened);
        OneSignal.addEventListener('ids', this.onIdsAvailable);
//        OneSignal.addEventListener('subscription', this.onSubscriptionChange);
//        OneSignal.addEventListener('permission', this.onPermissionChange);
        OneSignal.addEventListener('emailSubscription', this.onEmailSubscriptionChange);
        OneSignal.addEventListener('inAppMessageClicked', this.onInAppMessageClicked);
    }

    componentWillUnmount() {
        OneSignal.removeEventListener('received', this.onNotificationReceived);
        OneSignal.removeEventListener('opened', this.onNotificationOpened);
        OneSignal.removeEventListener('ids', this.onIdsAvailable);
//        OneSignal.removeEventListener('subscription', this.onSubscriptionChange);
//        OneSignal.removeEventListener('permission', this.onPermissionChange);
        OneSignal.removeEventListener('emailSubscription', this.onEmailSubscriptionChange);
        OneSignal.removeEventListener('inAppMessageClicked', this.onInAppMessageClicked);
    }

    /**
     Validate email method
     */
    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    /**
     In-App Message public method examples
     */
    oneSignalInAppMessagingExamples() {
        // Add a single trigger with a value associated with it
        OneSignal.addTrigger('trigger1', 'one');

        // Get trigger value for the key
        OneSignal.getTriggerValueForKey('trigger1')
            .then(response => {
                console.log('trigger1 value: ' + response);
            })
            .catch(e => {
                console.error(e);
            });

        // Create a set of triggers in a map and add them all at once
        var triggers = {
            trigger2: '2',
            trigger3: true,
        };
        OneSignal.addTriggers(triggers);

        // Get trigger value for the key
        OneSignal.getTriggerValueForKey('trigger3')
            .then(response => {
                console.log('trigger3 value: ' + response);
            })
            .catch(e => {
                console.error(e);
            });

        // Create an array of keys to remove triggers for
        var removeTriggers = ['trigger1', 'trigger2'];
        OneSignal.removeTriggersForKeys(removeTriggers);
    }

    /**
     Outcomes public method examples
     */
    oneSignalOutcomeEventsExamples() {
        // Send an outcome event with and without a callback
        OneSignal.sendOutcome('normal_1');
        OneSignal.sendOutcome('normal_2', response => {
              console.log('Normal outcome sent successfully!');
              console.log(response);
        });

        // Send a unique outcome event with and without a callback
        OneSignal.sendUniqueOutcome('unique_1');
        OneSignal.sendUniqueOutcome('unique_2', response => {
              console.log('Unique outcome sent successfully!');
              console.log(response);
        });

        // Send an outcome event with and without a callback
        OneSignal.sendOutcomeWithValue('value_1', 9.99);
        OneSignal.sendOutcomeWithValue('value_2', 5, response => {
              console.log('Outcome with value sent successfully!');
              console.log(response);
        });
    }

    /**
     When a notification is received this will fire
     */
    onNotificationReceived = (notification) => {
        console.log('Notification received: ', notification);

        let debugMsg = 'RECEIVED: \n' + JSON.stringify(notification, null, 2);
        this.setState({debugText:debugMsg}, () => {
            console.log("Debug text successfully changed!");
        });
    }

    /**
     When a notification is opened this will fire
     The openResult will contain information about the notification opened
     */
    onNotificationOpened = (openResult) => {
        console.log('Message: ', openResult.notification.payload.body);
        console.log('Data: ', openResult.notification.payload.additionalData);
        console.log('isActive: ', openResult.notification.isAppInFocus);
        console.log('openResult: ', openResult);

        let debugMsg = 'OPENED: \n' + JSON.stringify(openResult.notification, null, 2);
        this.setState({debugText:debugMsg}, () => {
            console.log("Debug text successfully changed!");
        });
    }

    /**
     Once the user is registered/updated the onIds will send back the userId and pushToken
        of the device
     */
    onIdsAvailable = (device) => {
        console.log('Device info: ', device);
        // Save the userId and pushToken for the device, important for updating the device
        //  record using the SDK, and sending notifications
        this.setState({
            userId: device.userId,
            pushToken: device.pushToken
        });
    }

    /**
     TODO: Needs to be implemented still in index.js and RNOneSignal.java
     */
    onSubscriptionChange = (change) => {
        console.log('onSubscriptionChange: ', change);
    }

    /**
     TODO: Needs to be implemented still in index.js and RNOneSignal.java
     */
    onPermissionChange = (change) => {
        console.log('onPermissionChange: ', change);
    }

    /**
     Success for the change of state for the email record? or setting subscription state of email record (so logging out)?
     TODO: Validate functionality and make sure name is correct
        Should match the onSubscriptionChange and

     TODO: Validate this is working, might be broken after changing name
     */
    onEmailSubscriptionChange = (change) => {
        console.log('onEmailSubscriptionChange: ', change);
        this.setState({isEmailLoading:false});
    }

    /**
     When an element on an IAM is clicked this will fire
     The actionResult will contain information about the element clicked
     */
    onInAppMessageClicked = (actionResult) => {
        console.log('actionResult: ', actionResult);

        let debugMsg = 'CLICKED: \n' + JSON.stringify(actionResult, null, 2);
        this.setState({debugText:debugMsg}, () => {
            console.log("Debug text successfully changed!");
        });
    }

    render() {
        return (
            <ScrollView style={styles.scrollView}>
                { this.createTitleFields() }

                <View style={styles.container}>
                    { this.createSubscribeFields() }
                    { this.createPrivacyConsentFields() }
                    { this.createEmailFields() }
                    { this.createExternalUserIdFields() }

                </View>

            </ScrollView>
        );
    }

    /**
     Create a red OneSignal Button with a name, loading state, and callback (onPress)
     */
    renderButtonView = (name, isLoading, callback) => {
        let isPrivacyConsentButton = name.includes("Consent");

        if (isPrivacyConsentButton && !requiresPrivacyConsent)
            return null;

        let isClickable = !isLoading
            && (!requiresPrivacyConsent
                || this.state.hasPrivacyConsent
                || isPrivacyConsentButton);

        return (
            <View
                key={name + '_parent'}
                style={styles.buttonContainer}
            >

                <Button
                    key={name}
                    title={isLoading ? name + "..." : name}
                    color={isClickable ? textInputBorderColor : disabledColor}
                    onPress={() => { isClickable && callback() }}
                />
            </View>
        );
    }

    /**
     Create a red OneSignal TextInput with a name, value, loading state, and callback (onPress)
     */
    renderFieldView = (name, value, isLoading, callback) => {
        let isEditable = !isLoading
            && (!requiresPrivacyConsent
                || this.state.hasPrivacyConsent);

        return (
            <KeyboardAvoidingView
                key={name + '_keyboard_avoiding_view'}
                style={{
                    width: 300,
                    height: 40,
                    borderColor: isEditable ? textInputBorderColor : disabledColor,
                    borderWidth: 2,
                    borderRadius: 5,
                    marginTop: 8}}
            >

                <TextInput
                    key={name}
                    style={styles.textInput}
                    placeholder={name}
                    value={value}
                    multiline={false}
                    returnKeyType="done"
                    textAlign="center"
                    placeholderTextColor="#d1dde3"
                    editable={isEditable}
                    autoCapitalize="none"
                    onChangeText={callback}
                />
            </KeyboardAvoidingView>
        );
    }

    /**
     ADD MORE GENERIC UI METHODS HERE...
     */

    /**
     Create the fields for displaying information about the demo app and some instruction
        for modifying the demo app or react-native SDK
     */
    createTitleFields() {
        // States used through-out the title fields
        const {
            debugText
        } = this.state;

        return (
            <View style={styles.container}>
                <View>
                    <Image style={styles.imageStyle} source={{uri: imageUri}} />
                </View>

                <Text style={styles.welcome}>
                    Welcome to React Native!
                </Text>

                <Text style={styles.instructions}>
                    To get started using the OneSignal SDK, edit App.js
                </Text>

                <Text style={styles.instructions}>
                    To get started modifying the OneSignal SDK, edit index.js
                </Text>

                <Text style={styles.instructions}>
                    Double tap R on your keyboard to reload,{'\n'}
                    Shake or press menu button for dev menu
                </Text>

                <Text style={styles.jsonDebugLabelText}>
                    {debugText}
                </Text>

                <Text style={styles.instructions}>
                    App Id:{'\n'}
                    {appId}
                </Text>
            </View>
        );
    }

    /**
     Create the fields necessary to test subscription with OneSignal SDK
     */
    createSubscribeFields() {
        // States used through-out the subscription fields
        const {
            isSubscribed,
            isSubscriptionLoading,
            isPrivacyConsentLoading
        } = this.state;

        let elements = [];

        // Subscribe Button
        let subscribedButton =  this.renderButtonView(
           isSubscribed ? "Unsubscribe" : "Subscribe",
           isSubscriptionLoading || isPrivacyConsentLoading,
           () => {
               let newSubscription = !isSubscribed;
               this.setState({isSubscribed:newSubscription, isSubscriptionLoading: true}, () => {
                   OneSignal.setSubscription(newSubscription);

                   // TODO: Move this into onSubscriptionChange method once implemented
                   this.setState({isSubscriptionLoading: false});
               });
           }
       );

        elements.push(
            subscribedButton
        );

        return elements;
    }

    /**
     Create the fields necessary to test privacy consent with OneSignal SDK
     */
    createPrivacyConsentFields() {
        // States used through-out the privacy consent fields
        const {
            hasPrivacyConsent,
            isPrivacyConsentLoading
        } = this.state;

        let elements = [];

        // Privacy Consent Button
        let privacyConsentButton = this.renderButtonView(
            hasPrivacyConsent ? "Remove Consent" : "Grant Consent",
            isPrivacyConsentLoading,
            () => {
                let privacyConsent = !hasPrivacyConsent;
                this.setState({hasPrivacyConsent:privacyConsent}, () => {
                    OneSignal.provideUserConsent(privacyConsent);
                });
            }
        );

        elements.push(
            privacyConsentButton
        );

        return elements;
    }

    /**
     Create the fields necessary to test email with OneSignal SDK
     */
    createEmailFields() {
        // States used through-out the email fields
        const {
            email,
            isEmailLoading,
            isPrivacyConsentLoading
        } = this.state;

        let elements = [];

        // Email TextInput
        let emailTextInput = this.renderFieldView(
            "Email",
            email,
            isEmailLoading || isPrivacyConsentLoading,
            (text) => {
                this.setState({email:text});
            }
        );

        // Set Email Button
        let setEmailButton = this.renderButtonView(
            "Set Email",
            isEmailLoading || isPrivacyConsentLoading,
            () => {
                console.log('Attempting to set email: ' + email);
                this.setState({isEmailLoading:true}, () => {
                    // OneSignal setEmail
                    OneSignal.setEmail(email, null, (error) => {
                        if (error) {
                            console.log('Error while setting email: ' + email);
                        } else {
                            console.log('Success setting email: ' + email);
                        }

                        this.setState({isEmailLoading:false});
                    });
                });
            }
        );

        // Logout Email Button
        let logoutEmailButton = this.renderButtonView(
            "Logout Email",
            isEmailLoading || isPrivacyConsentLoading,
            () => {
                console.log('Attempting to logout email');
                this.setState({isEmailLoading:true}, () => {
                    // OneSignal logoutEmail
                    OneSignal.logoutEmail((error) => {
                        if (error) {
                            console.log('Error while logging out email');
                        } else {
                            console.log('Success logging out email');
                        }

                        this.setState({isEmailLoading:false});
                    });
                });
            }
        );

        elements.push(
            emailTextInput,
            setEmailButton,
            logoutEmailButton
        );

        return elements;
    }

    /**
     Create the fields necessary to test external user id with OneSignal SDK
     */
    createExternalUserIdFields() {
        // States used through-out the email fields
        const {
            externalUserId,
            isExternalUserIdLoading,
            isPrivacyConsentLoading
        } = this.state;

        let elements = [];

        // External User Id TextInput
        let externalUserIdTextInput = this.renderFieldView(
            "External User Id",
            externalUserId,
            isExternalUserIdLoading || isPrivacyConsentLoading,
            (text) => {
                this.setState({externalUserId:text});
            }
        )

        // Set External User Id Button
        let setExternalUserIdButton = this.renderButtonView(
            "Set External User Id",
            isExternalUserIdLoading || isPrivacyConsentLoading,
            () => {
                console.log('Attempting to set external user id: ' + externalUserId);
                this.setState({isExternalUserIdLoading:true}, () => {
                    // OneSignal setExternalUserId
                    OneSignal.setExternalUserId(externalUserId, (results) => {
                        console.log('Results of setting external user id');
                        console.log(results);

                        this.setState({isExternalUserIdLoading:false});
                    });
                });
            }
        )

        // Remove External User Id Button
        let removeExternalUserIdButton = this.renderButtonView(
            "Remove External User Id",
            isExternalUserIdLoading || isPrivacyConsentLoading,
            () => {
                console.log('Attempting to remove external user id');
                this.setState({isExternalUserIdLoading:true}, () => {
                    // OneSignal setExternalUserId
                    OneSignal.removeExternalUserId((results) => {
                        console.log('Results of removing external user id');
                        console.log(results);

                        this.setState({isExternalUserIdLoading:false});
                    });
                });
            }
        )

        elements.push(
            externalUserIdTextInput,
            setExternalUserIdButton,
            removeExternalUserIdButton
        );

        return elements;
    }

    /**
     ADD MORE UI METHODS HERE...
     */

}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#F5FCFF',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
        marginHorizontal: 10,
    },
    jsonDebugLabelText: {
        textAlign: 'left',
        color: '#333333',
        marginBottom: 5,
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 10,
        marginVertical: 10,
        marginHorizontal: 10,
    },
    imageStyle: {
        height: 200,
        width: 200,
        marginTop: 20,
    },
    textInput: {
        marginHorizontal: 10,
        height: 40,
    },
});

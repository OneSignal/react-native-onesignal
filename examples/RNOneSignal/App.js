/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    ScrollView,
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
 React Native Demo App: ce8572ae-ff57-4e77-a265-5c91f00ecc4c
 */
var appId = 'ce8572ae-ff57-4e77-a265-5c91f00ecc4c';

/**
 Controls whether the app needs privacy consent or not
 Will hide the button when false and show it when true
 */
var requiresPrivacyConsent = false;

export default class App extends Component {

    constructor(properties) {
        super(properties);

        this.state = {
            /* OneSignal states*/
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
            iamPaused: false,

            // Demo App states
            debugText: ''

            // Add more states here...
        };

    }

    /* R E A C T  L I F E C Y C L E */

    async componentDidMount() {
        console.log("Mounted!");
        /* O N E S I G N A L  S E T U P */
        // Log level logcat is 6 (VERBOSE) and log level alert is 0 (NONE)
        OneSignal.setLogLevel(6, 0);
        OneSignal.setAppId(appId);
        OneSignal.setRequiresUserPrivacyConsent(requiresPrivacyConsent);
        OneSignal.setLocationShared(true);
        OneSignal.promptForPushNotificationsWithUserResponse(response => {
            console.log("Prompt response:", response);
        });
        /* O N E S I G N A L  H A N D L E R S */
        OneSignal.setNotificationWillShowInForegroundHandler(notifReceivedEvent => {
            console.log("OneSignal: notification will show in foreground:", notifReceivedEvent);
            let notif = notifReceivedEvent.getNotification();
            setTimeout(()=>notifReceivedEvent.complete(notif), 0);
        });
        OneSignal.setNotificationOpenedHandler(notification => {
            console.log("OneSignal: notification opened:", notification);
        });
        OneSignal.setInAppMessageClickHandler(event => {
            console.log("OneSignal IAM clicked:", event);
        });
        OneSignal.addEmailSubscriptionObserver((event) => {
            console.log("OneSignal: email subscription changed: ", event);
        });
        OneSignal.addSubscriptionObserver(event => {
            console.log("OneSignal: subscription changed:", event);
            if (Platform.OS === "android") {
                this.setState({ isSubscribed: event.to.isSubscribed });
            } else {
                this.setState({ isSubscribed: event.subscribed });
            }
        });
        OneSignal.addPermissionObserver(event => {
            console.log("OneSignal: permission changed:", event);
        });

        //If the app requires privacy consent check if it has been set yet
        if (requiresPrivacyConsent) {
        // async 'then' is only so I can sleep using the Promise helper method
            OneSignal.userProvidedPrivacyConsent().then(async (granted) => {
                // For UI testing purposes wait X seconds to see the loading state
                await sleep(0);

                console.log('OneSignal: Privacy Consent status: ' + granted);
                this.setState({hasPrivacyConsent:granted, isPrivacyConsentLoading:false});
            });
        }

        let deviceState = await OneSignal.getDeviceState();
        this.setState({
            isSubscribed: deviceState.isSubscribed,
            userId      : deviceState.userId
        });

        // Examples for using native IAM public methods
        // this.oneSignalInAppMessagingExamples();

        // Examples for using native Outcome Event public methods
        // this.oneSignalOutcomeEventsExamples();

    }

    componentWillUnmount() {
        OneSignal.clearHandlers();
    }

    /* H E L P E R S */

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

    render() {
        return (
            <ScrollView style={styles.scrollView}>
                { this.createTitleFields() }

                <View style={styles.container}>
                    { this.createSubscribeFields() }
                    { this.createPrivacyConsentFields() }
                    { this.createEmailFields() }
                    { this.createExternalUserIdFields() }
                    { this.createSubscriptionElements() }
                    { this.createNotificationElements() }
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
            isPrivacyConsentLoading
        } = this.state;

        let elements = [];

        // Subscribe Button
        let subscribedButton =  this.renderButtonView(
           isSubscribed ? "Unsubscribe" : "Subscribe",
           isPrivacyConsentLoading,
           () => {
               console.log(`Setting subscription to ${!isSubscribed}`);
               OneSignal.disablePush(isSubscribed);
               this.setState({isSubscribed: !isSubscribed});
           }
       );

        elements.push(
            subscribedButton
        );

        return elements;
    }

    createSubscriptionElements() {
        let elements = [];
        const {
            isPrivacyConsentLoading
        } = this.state;

        let getDeviceState = this.renderButtonView(
            "Get Device State",
            isPrivacyConsentLoading,
            async () => {
                let state = await OneSignal.getDeviceState();
                console.log("Device state:", state);
            }
        );

        elements.push(
            getDeviceState
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
                            //OneSignal.deleteTags(['a']);
                        } else {
                            console.log('Success logging out email');
                        }

                        this.setState({isEmailLoading:false});
                    });
                });
            }
        );

        let sendTagsButtons = this.renderButtonView(
            "Send Tags",
            isPrivacyConsentLoading,
            () => {
                const tags = {'a': 1, 'b':2, 'c':3};
                console.log(`Attempting to send tags ${JSON.stringify(tags)}`);
                OneSignal.sendTags(tags);
            }
        );

        let deleteTags = this.renderButtonView(
            "Delete Tags",
            isPrivacyConsentLoading,
            () => {
                console.log('Deleting tags');
                OneSignal.deleteTags(['b']);
            }
        );

        elements.push(
            emailTextInput,
            setEmailButton,
            logoutEmailButton,
            sendTagsButtons,
            deleteTags,
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
                this.setState({ isExternalUserIdLoading:true }, () => {
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
                this.setState({ isExternalUserIdLoading: true }, () => {
                    // OneSignal setExternalUserId
                    OneSignal.removeExternalUserId((results) => {
                        console.log('Results of removing external user id');
                        console.log(results);

                        this.setState({ isExternalUserIdLoading:false });
                    });
                });
            }
        )
    }

    createNotificationElements() {
        // States used through-out the email fields
        const {
            externalUserId,
            isExternalUserIdLoading,
            isPrivacyConsentLoading
        } = this.state;

        let elements = [];

        // Remove External User Id Button
        let postNotificationButton = this.renderButtonView(
            "Post Notification",
            isExternalUserIdLoading || isPrivacyConsentLoading,
            async () => {
                const { userId } = await OneSignal.getDeviceState();
                const notificationObj = {
                    contents: {en: "Message Body"},
                    include_player_ids: [userId]
                };
                const json = JSON.stringify(notificationObj);

                console.log('Attempting to send notification to '+userId);

                OneSignal.postNotification(json, (success) => {
                    console.log("Success:", success);
                }, (failure) => {
                    console.log("Failure:", failure );
                });
            }
        )

        elements.push(
            postNotificationButton
        );

        return elements;
    }
}

/* S T Y L E S */
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

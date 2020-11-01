import OneSignal from 'react-native-onesignal';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { renderButtonView, renderFieldView } from './Helpers';

export interface Props {
  isSubscribed: boolean;
}

export interface State {
    isSubscribed: boolean;
    state: any;
}

class OSButtons extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isSubscribed: props.isSubscribed,
            state: {}
        };
    }

    async componentDidMount() {
        let state = await OneSignal.getDeviceState();
        this.setState({ state })
    }

    createSubscribeFields() {
        const { isSubscribed } = this.props;

        let subscribedButton = renderButtonView(
            isSubscribed ? "Unsubscribe" : "Subscribe",
            () => {
                console.log("Disabling push", isSubscribed);
                OneSignal.disablePush(isSubscribed);
            }
        )
        return subscribedButton;
    }

    createDeviceFields() {
        let deviceStateButton = renderButtonView("Get Device State", async () => {
            let deviceState = await OneSignal.getDeviceState();
            console.log("Device State:", deviceState);
        })
        return deviceStateButton;
    }

    createNotificationFields() {
        let postNotificationButton = renderButtonView(
            "Post Notification",
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
            })
        return postNotificationButton;
    }

    /**
     Create the fields necessary to test email with OneSignal SDK
     */
    createEmailFields() {
        let elements = [];
        const {
            email,
            isEmailLoading,
            isPrivacyConsentLoading
        } = this.state.state;

        // Email TextInput
        let emailTextInput = renderFieldView(
            "Email",
            email,
            (text:string) => {
                this.setState({ email:text });
            }
        );

        // Set Email Button
        let setEmailButton = renderButtonView(
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

        const sendUniqueOutcomeButton = renderButtonView(
            "Send Unique Outcome With Name",
            color,
            () => {
                loggingFunction("Sending unique outcome: ", this.props.inputFieldValue);
                OneSignal.sendUniqueOutcome(this.props.inputFieldValue, (event: OutcomeEvent) => {
                    loggingFunction("Unique Outcome Event: ", event);
                });
            }
        );

        const sendOutcomeWithValueButton = renderButtonView(
            "Send Outcome 'my_outcome' with value",
            color,
            () => {
                loggingFunction("Sending outcome of name 'my_outcome' with value: ", this.props.inputFieldValue);
                if (typeof this.props.inputFieldValue !== 'number') {
                    console.error("Outcome with value should be a number");
                    return;
                }
                OneSignal.sendOutcomeWithValue('my_outcome', this.props.inputFieldValue, (event: OutcomeEvent) => {
                    loggingFunction("Outcome With Value Event: ", event);
                });
            }
        );

        elements.push(sendOutcomeButton, sendUniqueOutcomeButton, sendOutcomeWithValueButton);
        return elements;
    }

    render() {
        return (
            <View style={ styles.root }>
                <View style={ styles.container }>
                    { this.createSubscribeFields() }
                    { this.createDeviceFields() }
                    { this.createNotificationFields() }
                </View>
            </View>
        );
    }
};

// styles
const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'center'
  },
  buttons: {
    flexDirection: 'row',
    minHeight: 70,
    alignItems: 'stretch',
    alignSelf: 'center',
    borderWidth: 5
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  button: {
    flex: 1,
    paddingVertical: 0
  },
  greeting: {
    color: '#999',
    fontWeight: 'bold'
  }
});

export default OSButtons;

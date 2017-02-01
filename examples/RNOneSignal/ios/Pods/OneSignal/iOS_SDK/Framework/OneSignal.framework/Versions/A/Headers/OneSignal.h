/**
 * Modified MIT License
 *
 * Copyright 2016 OneSignal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * 1. The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * 2. All copies of substantial portions of the Software may only be used in connection
 * with services provided by OneSignal.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/***
 
 ### Setting up the SDK ###
 Follow the documentation from https://documentation.onesignal.com/docs/installing-the-onesignal-ios-sdk to setup OneSignal in your app.
 
 ### API Reference ###
 Follow the documentation from https://documentation.onesignal.com/docs/ios-sdk-api for a detailed explanation of the API.
 
 ### FAQ & Troubleshoot ###
 FAQ: https://documentation.onesignal.com/docs/frequently-asked-questions-1
 Troubleshoot: https://documentation.onesignal.com/docs/common-problems-1
 
 For help on how to upgrade your code from 1.* SDK to 2.*: https://documentation.onesignal.com/docs/upgrading-to-sdk-20
 
 ### More ###
 iOS Configuration: https://documentation.onesignal.com/docs/generating-an-ios-push-certificate
 REST API: https://documentation.onesignal.com/docs/server-api-overview
 Create Notification API: https://documentation.onesignal.com/docs/notifications-create-notification
 
***/

#import <Foundation/Foundation.h>

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 100000
#define XC8_AVAILABLE 1
#import <UserNotifications/UserNotifications.h>

#endif

/* The action type associated to an OSNotificationAction object */
typedef NS_ENUM(NSUInteger, OSNotificationActionType)  {
    OSNotificationActionTypeOpened,
    OSNotificationActionTypeActionTaken
} ;

/* The way a notification was displayed to the user */
typedef NS_ENUM(NSUInteger, OSNotificationDisplayType) {
    /*Notification is silent, or app is in focus but InAppAlertNotifications are disabled*/
    OSNotificationDisplayTypeNone,
    
    /*Default UIAlertView display*/
    OSNotificationDisplayTypeInAppAlert,
    
    /*iOS native notification display*/
    OSNotificationDisplayTypeNotification
} ;



/*
 Used as value type for `kOSSettingsKeyInFocusDisplayOption`
   for setting the display option of a notification received while the app was in focus.
 */
typedef OSNotificationDisplayType OSInFocusDisplayOption;


@interface OSNotificationAction : NSObject

/* The type of the notification action */
@property(readonly)OSNotificationActionType type;

/* The ID associated with the button tapped. NULL when the actionType is NotificationTapped or InAppAlertClosed */
@property(readonly)NSString* actionID;

@end

@interface OSNotificationPayload : NSObject

/* Unique Message Identifier */
@property(readonly)NSString* notificationID;

/* Provide this key with a value of 1 to indicate that new content is available.
 Including this key and value means that when your app is launched in the background or resumed application:didReceiveRemoteNotification:fetchCompletionHandler: is called. */
@property(readonly)BOOL contentAvailable;

/* The badge assigned to the application icon */
@property(readonly)NSUInteger badge;

/* The sound parameter passed to the notification
 By default set to UILocalNotificationDefaultSoundName */
@property(readonly)NSString* sound;

/* Main push content */
@property(readonly)NSString* title;
@property(readonly)NSString* subtitle;
@property(readonly)NSString* body;

/* Web address to launch within the app via a UIWebView */
@property(readonly)NSString* launchURL;

/* Additional key value properties set within the payload */
@property(readonly)NSDictionary* additionalData;

/* iOS 10+ : Attachments sent as part of the rich notification */
@property(readonly)NSDictionary* attachments;

/* Action buttons passed */
@property(readonly)NSArray *actionButtons;

/* Holds the original payload received
 Keep the raw value for users that would like to root the push */
@property(readonly)NSDictionary *rawPayload;

@end

@interface OSNotification : NSObject

/* Notification Payload */
@property(readonly)OSNotificationPayload* payload;

/* Display method of the notification */
@property(readonly)OSNotificationDisplayType displayType;

/* Set to true when the user was able to see the notification and reacted to it
 Set to false when app is in focus and in-app alerts are disabled, or the remote notification is silent. */
@property(readonly, getter=wasShown)BOOL shown;

/* Set to true if the app was in focus when the notification  */
@property(readonly, getter=wasAppInFocus)BOOL isAppInFocus;

/* Set to true when the received notification is silent
 Silent means there is no alert, sound, or badge payload in the aps dictionary
 requires remote-notification within UIBackgroundModes array of the Info.plist */
@property(readonly, getter=isSilentNotification)BOOL silentNotification;

/* iOS 10+: Indicates wether or not the received notification has mutableContent : 1 assigned to its payload
 Used for UNNotificationServiceExtension to launch extension.
*/
#if XC8_AVAILABLE
@property(readonly, getter=hasMutableContent)BOOL mutableContent;
#endif

/* Convert object into an NSString that can be convertible into a custom Dictionary / JSON Object */
- (NSString*)stringify;

@end


@interface OSNotificationOpenedResult : NSObject

@property(readonly)OSNotification* notification;

@property(readonly)OSNotificationAction *action;

/* Convert object into an NSString that can be convertible into a custom Dictionary / JSON Object */
- (NSString*)stringify;

@end;

typedef void (^OSResultSuccessBlock)(NSDictionary* result);
typedef void (^OSFailureBlock)(NSError* error);

/*Block for notifying avalability of the User's ID and push token*/
typedef void (^OSIdsAvailableBlock)(NSString* userId, NSString* pushToken);

/*Block for handling the reception of a remote notification */
typedef void (^OSHandleNotificationReceivedBlock)(OSNotification* notification);

/*Block for handling a user reaction to a notification*/
typedef void (^OSHandleNotificationActionBlock)(OSNotificationOpenedResult * result);

/*Dictionary of keys to pass alongside the init serttings*/
    
/*Let OneSignal directly promt for push notifications on init*/
extern NSString * const kOSSettingsKeyAutoPrompt;
    
/*Enable the default in-app alerts*/
extern NSString * const kOSSettingsKeyInAppAlerts;

/*Enable In-App display of Launch URLs*/
extern NSString * const kOSSettingsKeyInAppLaunchURL;

/* iOS10+ - 
 Set notificaion's in-focus display option.
 Value must be an OSNotificationDisplayType enum
*/
extern NSString * const kOSSettingsKeyInFocusDisplayOption;

/**
    OneSignal provides a high level interface to interact with OneSignal's push service.
    OneSignal is a singleton for applications which use a globally available client to share configuration settings.
    You should avoid creating instances of this class at all costs. Instead, access its instance methods.
    Include `#import <OneSignal/OneSignal.h>` in your application files to access OneSignal's methods.
 **/
@interface OneSignal : NSObject

extern NSString* const ONESIGNAL_VERSION;

typedef NS_ENUM(NSUInteger, ONE_S_LOG_LEVEL) {
    ONE_S_LL_NONE, ONE_S_LL_FATAL, ONE_S_LL_ERROR, ONE_S_LL_WARN, ONE_S_LL_INFO, ONE_S_LL_DEBUG, ONE_S_LL_VERBOSE
};

///--------------------
/// @name Initialize`
///--------------------

/**
 Initialize OneSignal. Sends push token to OneSignal so you can later send notifications.
 
*/

// - Initialization
+ (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId;
+ (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId handleNotificationAction:(OSHandleNotificationActionBlock)actionCallback;
+ (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId handleNotificationAction:(OSHandleNotificationActionBlock)actionCallback settings:(NSDictionary*)settings;
+ (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId handleNotificationReceived:(OSHandleNotificationReceivedBlock)receivedCallback handleNotificationAction:(OSHandleNotificationActionBlock)actionCallback settings:(NSDictionary*)settings;

+ (NSString*)app_id;

// Only use if you passed FALSE to autoRegister
+ (void)registerForPushNotifications;

// - Logging
+ (void)setLogLevel:(ONE_S_LOG_LEVEL)logLevel visualLevel:(ONE_S_LOG_LEVEL)visualLogLevel;
+ (void) onesignal_Log:(ONE_S_LOG_LEVEL)logLevel message:(NSString*)message;

// - Tagging
+ (void)sendTag:(NSString*)key value:(NSString*)value onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)sendTag:(NSString*)key value:(NSString*)value;
+ (void)sendTags:(NSDictionary*)keyValuePair onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)sendTags:(NSDictionary*)keyValuePair;
+ (void)sendTagsWithJsonString:(NSString*)jsonString;
+ (void)getTags:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)getTags:(OSResultSuccessBlock)successBlock;
+ (void)deleteTag:(NSString*)key onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)deleteTag:(NSString*)key;
+ (void)deleteTags:(NSArray*)keys onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)deleteTags:(NSArray*)keys;
+ (void)deleteTagsWithJsonString:(NSString*)jsonString;

// - Get user ID & Push Token
+ (void)IdsAvailable:(OSIdsAvailableBlock)idsAvailableBlock;

// - Alerting
+ (void)setSubscription:(BOOL)enable;

// - Posting Notification
+ (void)postNotification:(NSDictionary*)jsonData;
+ (void)postNotification:(NSDictionary*)jsonData onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)postNotificationWithJsonString:(NSString*)jsonData onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (NSString*)parseNSErrorAsJsonString:(NSError*)error;

// - Request and track user's location
+ (void)promptLocation;
+ (void)setLocationShared:(BOOL)enable;

// - Sends the MD5 and SHA1 of the provided email
// Optional method that sends us the user's email as an anonymized hash so that we can better target and personalize notifications sent to that user across their devices.
+ (void)syncHashedEmail:(NSString*)email;

@end

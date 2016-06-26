/**
 * Copyright 2015 OneSignal
 * Portions Copyright 2014 StackMob
 *
 * This file includes portions from the StackMob iOS SDK and distributed under an Apache 2.0 license.
 * StackMob was acquired by PayPal and ceased operation on May 22, 2014.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import <Foundation/Foundation.h>

typedef void (^OneSignalResultSuccessBlock)(NSDictionary* result);
typedef void (^OneSignalFailureBlock)(NSError* error);
typedef void (^OneSignalIdsAvailableBlock)(NSString* userId, NSString* pushToken);
typedef void (^OneSignalHandleNotificationBlock)(NSString* message, NSDictionary* additionalData, BOOL isActive);

/**
 `OneSignal` provides a high level interface to interact with OneSignal's push service.
 
 `OneSignal` exposes a defaultClient for applications which use a globally available client to share configuration settings.
 
 Include `#import "OneSignal/OneSignal.h"` in your application files to access OneSignal's methods.
 
 ### Setting up the SDK ###
 
 Follow the documentation from http://documentation.gamethrive.com/v1.0/docs/installing-the-gamethrive-ios-sdk to setup with your game.
 
 */
@interface OneSignal : NSObject

@property(nonatomic, readonly, copy) NSString* app_id;

extern NSString* const ONESIGNAL_VERSION;

typedef NS_ENUM(NSUInteger, ONE_S_LOG_LEVEL) {
    ONE_S_LL_NONE, ONE_S_LL_FATAL, ONE_S_LL_ERROR, ONE_S_LL_WARN, ONE_S_LL_INFO, ONE_S_LL_DEBUG, ONE_S_LL_VERBOSE
};

///--------------------
/// @name Initialize
///--------------------

/**
 Initialize OneSignal. Sends push token to OneSignal so you can later send notifications.
 
 */

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions;

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions autoRegister:(BOOL)autoRegister;

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId;

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions handleNotification:(OneSignalHandleNotificationBlock)callback;

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId handleNotification:(OneSignalHandleNotificationBlock)callback;

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions handleNotification:(OneSignalHandleNotificationBlock)callback autoRegister:(BOOL)autoRegister;

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString*)appId handleNotification:(OneSignalHandleNotificationBlock)callback autoRegister:(BOOL)autoRegister;

// Only use if you passed FALSE to autoRegister
- (void)registerForPushNotifications;

+ (void)setLogLevel:(ONE_S_LOG_LEVEL)logLevel visualLevel:(ONE_S_LOG_LEVEL)visualLogLevel;

+ (void)setDefaultClient:(OneSignal*)client;
+ (OneSignal*)defaultClient;

- (void)sendTag:(NSString*)key value:(NSString*)value onSuccess:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;
- (void)sendTag:(NSString*)key value:(NSString*)value;

- (void)sendTags:(NSDictionary*)keyValuePair onSuccess:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;
- (void)sendTags:(NSDictionary*)keyValuePair;
- (void)sendTagsWithJsonString:(NSString*)jsonString;

- (void)setEmail:(NSString*)email;

- (void)getTags:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;
- (void)getTags:(OneSignalResultSuccessBlock)successBlock;

- (void)deleteTag:(NSString*)key onSuccess:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;
- (void)deleteTag:(NSString*)key;

- (void)deleteTags:(NSArray*)keys onSuccess:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;
- (void)deleteTags:(NSArray*)keys;
- (void)deleteTagsWithJsonString:(NSString*)jsonString;

- (void)IdsAvailable:(OneSignalIdsAvailableBlock)idsAvailableBlock;

- (void)enableInAppAlertNotification:(BOOL)enable;
- (void)setSubscription:(BOOL)enable;

- (void)postNotification:(NSDictionary*)jsonData;
- (void)postNotification:(NSDictionary*)jsonData onSuccess:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;
- (void)postNotificationWithJsonString:(NSString*)jsonData onSuccess:(OneSignalResultSuccessBlock)successBlock onFailure:(OneSignalFailureBlock)failureBlock;

- (void)promptLocation;

+ (void) onesignal_Log:(ONE_S_LOG_LEVEL)logLevel message:(NSString*)message;

@end


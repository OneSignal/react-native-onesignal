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

#import "OneSignal.h"
#import "OneSignalWebView.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

@interface OneSignalHelper : NSObject

// - Web
+ (OneSignalWebView*)webVC;
+ (void) displayWebView:(NSURL*)url;

// - Notification Opened
+ (NSDictionary*)getPushTitleBody:(NSDictionary*)messageDict;
+ (NSArray*)getActionButtons:(NSDictionary*)messageDict;
+ (NSMutableDictionary*) formatApsPayloadIntoStandard:(NSDictionary*)remoteUserInfo identifier:(NSString*)identifier;
+ (void)lastMessageReceived:(NSDictionary*)message;
+ (void)notificationBlocks:(OSHandleNotificationReceivedBlock)receivedBlock :(OSHandleNotificationActionBlock)actionBlock;
+ (void)handleNotificationReceived:(OSNotificationDisplayType)displayType;
+ (void)handleNotificationAction:(OSNotificationActionType)actionType actionID:(NSString*)actionID displayType:(OSNotificationDisplayType)displayType;

// - iOS 10
+ (BOOL)isIOSVersionGreaterOrEqual:(float)version;
#if XC8_AVAILABLE
+ (void)registerAsUNNotificationCenterDelegate;
+ (void)clearCachedMedia;
+ (id)prepareUNNotificationRequest:(NSDictionary *)data :(NSDictionary *)userInfo;
+ (void)addnotificationRequest:(NSDictionary *)data userInfo:(NSDictionary *)userInfo completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;
#endif

// - Notifications
+ (BOOL)canGetNotificationTypes;
+ (UILocalNotification*)prepareUILocalNotification:(NSDictionary*)data :(NSDictionary*)userInfo;
+ (BOOL)verifyURL:(NSString *)urlString;
+ (BOOL)isRemoteSilentNotification:(NSDictionary*)msg;

// - Networking
+ (NSNumber*)getNetType;
+ (void)enqueueRequest:(NSURLRequest*)request onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;
+ (void)enqueueRequest:(NSURLRequest*)request onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock isSynchronous:(BOOL)isSynchronous;
+ (void)handleJSONNSURLResponse:(NSURLResponse*) response data:(NSData*) data error:(NSError*) error onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock;

// Threading
+ (void) runOnMainThread:(void(^)())block;
+ (void) dispatch_async_on_main_queue:(void(^)())block;
+ (void)performSelector:(SEL)aSelector onMainThreadOnObject:(id)targetObj withObject:(id)anArgument afterDelay:(NSTimeInterval)delay;

// Other
+ (BOOL) isValidEmail:(NSString*)email;
+ (NSString*)hashUsingSha1:(NSString*)string;
+ (NSString*)hashUsingMD5:(NSString*)string;
+ (void)addAttachments:(NSDictionary*)attachments toNotificationContent:(id)content;
+ (void)addActionButtons:(NSArray*)buttonsPayloadList toNotificationContent:(id)content;
+ (NSString*)trimURLSpacing:(NSString*)url;

#pragma clang diagnostic pop
@end

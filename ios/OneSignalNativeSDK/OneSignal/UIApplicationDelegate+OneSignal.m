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

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#import "UIApplicationDelegate+OneSignal.h"
#import "OneSignal.h"
#import "OneSignalTracker.h"
#import "OneSignalLocation.h"
#import "OneSignalSelectorHelpers.h"
#import "OneSignalHelper.h"

@interface OneSignal (UN_extra)
+ (void) didRegisterForRemoteNotifications:(UIApplication*)app deviceToken:(NSData*)inDeviceToken;
+ (void) handleDidFailRegisterForRemoteNotification:(NSError*)error;
+ (void) updateNotificationTypes:(int)notificationTypes;
+ (NSString*) app_id;
+ (void) notificationOpened:(NSDictionary*)messageDict isActive:(BOOL)isActive;
+ (BOOL) remoteSilentNotification:(UIApplication*)application UserInfo:(NSDictionary*)userInfo completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler;
+ (void) processLocalActionBasedNotification:(UILocalNotification*) notification identifier:(NSString*)identifier;
+ (void) onesignal_Log:(ONE_S_LOG_LEVEL)logLevel message:(NSString*) message;
@end



// This class hooks into the UIApplicationDelegate selectors to receive iOS 9 and older events.
//   - UNUserNotificationCenter is used for iOS 10
//   - Orignal implementations are called so other plugins and the developers AppDelegate is still called.

@implementation OneSignalAppDelegate

+ (void) oneSignalLoadedTagSelector {}

static Class delegateClass = nil;

// Store an array of all UIAppDelegate subclasses to iterate over in cases where UIAppDelegate swizzled methods are not overriden in main AppDelegate
// But rather in one of the subclasses
static NSArray* delegateSubclasses = nil;

+(Class)delegateClass {
    return delegateClass;
}




- (void) setOneSignalDelegate:(id<UIApplicationDelegate>)delegate {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:[NSString stringWithFormat:@"ONESIGNAL setOneSignalDelegate CALLED: %@", delegate]];
    
    if (delegateClass) {
        [self setOneSignalDelegate:delegate];
        return;
    }
    
    Class newClass = [OneSignalAppDelegate class];
    
    delegateClass = getClassWithProtocolInHierarchy([delegate class], @protocol(UIApplicationDelegate));
    delegateSubclasses = ClassGetSubclasses(delegateClass);
    
    // Need to keep this one for iOS 10 for content-available notifiations when the app is not in focus
    //   iOS 10 doesn't fire a selector on UNUserNotificationCenter in this cases most likely becuase
    //   UNNotificationServiceExtension (mutable-content) and UNNotificationContentExtension (with category) replaced it.
    injectToProperClass(@selector(oneSignalRemoteSilentNotification:UserInfo:fetchCompletionHandler:),
                        @selector(application:didReceiveRemoteNotification:fetchCompletionHandler:), delegateSubclasses, newClass, delegateClass);
    
    [OneSignalAppDelegate sizzlePreiOS10MethodsPhase1];

    injectToProperClass(@selector(oneSignalDidFailRegisterForRemoteNotification:error:),
                        @selector(application:didFailToRegisterForRemoteNotificationsWithError:), delegateSubclasses, newClass, delegateClass);
    
    if (NSClassFromString(@"CoronaAppDelegate")) {
        [self setOneSignalDelegate:delegate];
        return;
    }
    
    injectToProperClass(@selector(oneSignalDidRegisterForRemoteNotifications:deviceToken:),
                        @selector(application:didRegisterForRemoteNotificationsWithDeviceToken:), delegateSubclasses, newClass, delegateClass);
    
    [OneSignalAppDelegate sizzlePreiOS10MethodsPhase2];
    
    injectToProperClass(@selector(oneSignalApplicationWillResignActive:),
                        @selector(applicationWillResignActive:), delegateSubclasses, newClass, delegateClass);
    
    // Required for background location
    injectToProperClass(@selector(oneSignalApplicationDidEnterBackground:),
                        @selector(applicationDidEnterBackground:), delegateSubclasses, newClass, delegateClass);
    
    injectToProperClass(@selector(oneSignalApplicationDidBecomeActive:),
                        @selector(applicationDidBecomeActive:), delegateSubclasses, newClass, delegateClass);
    
    // Used to track how long the app has been closed
    injectToProperClass(@selector(oneSignalApplicationWillTerminate:),
                        @selector(applicationWillTerminate:), delegateSubclasses, newClass, delegateClass);
    
    [self setOneSignalDelegate:delegate];
}

+ (void)sizzlePreiOS10MethodsPhase1 {
    if ([OneSignalHelper isIOSVersionGreaterOrEqual:10])
        return;
    
    injectToProperClass(@selector(oneSignalLocalNotificationOpened:handleActionWithIdentifier:forLocalNotification:completionHandler:),
                        @selector(application:handleActionWithIdentifier:forLocalNotification:completionHandler:), delegateSubclasses, [OneSignalAppDelegate class], delegateClass);
    
    // iOS 10 requestAuthorizationWithOptions has it's own callback
    //   We also check the permssion status from applicationDidBecomeActive: each time.
    //   Keeping for fallback in case of a race condidion where the focus event fires to soon.
    injectToProperClass(@selector(oneSignalDidRegisterUserNotifications:settings:),
                        @selector(application:didRegisterUserNotificationSettings:), delegateSubclasses, [OneSignalAppDelegate class], delegateClass);
}

+ (void)sizzlePreiOS10MethodsPhase2 {
    if ([OneSignalHelper isIOSVersionGreaterOrEqual:10])
        return;
    
    injectToProperClass(@selector(oneSignalReceivedRemoteNotification:userInfo:),
                        @selector(application:didReceiveRemoteNotification:), delegateSubclasses, [OneSignalAppDelegate class], delegateClass);
    
    injectToProperClass(@selector(oneSignalLocalNotificationOpened:notification:),
                        @selector(application:didReceiveLocalNotification:), delegateSubclasses, [OneSignalAppDelegate class], delegateClass);
}


- (void)oneSignalDidRegisterForRemoteNotifications:(UIApplication*)app deviceToken:(NSData*)inDeviceToken {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalDidRegisterForRemoteNotifications:deviceToken:"];
    
    [OneSignal didRegisterForRemoteNotifications:app deviceToken:inDeviceToken];
    
    if ([self respondsToSelector:@selector(oneSignalDidRegisterForRemoteNotifications:deviceToken:)])
        [self oneSignalDidRegisterForRemoteNotifications:app deviceToken:inDeviceToken];
}

- (void)oneSignalDidFailRegisterForRemoteNotification:(UIApplication*)app error:(NSError*)err {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalDidFailRegisterForRemoteNotification:error:"];
    
    if ([OneSignal app_id])
        [OneSignal handleDidFailRegisterForRemoteNotification:err];
    
    if ([self respondsToSelector:@selector(oneSignalDidFailRegisterForRemoteNotification:error:)])
        [self oneSignalDidFailRegisterForRemoteNotification:app error:err];
}

// iOS 8 & 9 Only
- (void)oneSignalDidRegisterUserNotifications:(UIApplication*)application settings:(UIUserNotificationSettings*)notificationSettings {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalDidRegisterUserNotifications:settings:"];
    
    if ([OneSignal app_id])
        [OneSignal updateNotificationTypes:notificationSettings.types];
    
    if ([self respondsToSelector:@selector(oneSignalDidRegisterUserNotifications:settings:)])
        [self oneSignalDidRegisterUserNotifications:application settings:notificationSettings];
}


// Fallback method - Normally this would not fire as oneSignalRemoteSilentNotification below will fire instead. Was needed for iOS 6 support in the past.
- (void)oneSignalReceivedRemoteNotification:(UIApplication*)application userInfo:(NSDictionary*)userInfo {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalReceivedRemoteNotification:userInfo:"];
    
    if ([OneSignal app_id])
        [OneSignal notificationOpened:userInfo isActive:[application applicationState] == UIApplicationStateActive];
    
    if ([self respondsToSelector:@selector(oneSignalReceivedRemoteNotification:userInfo:)])
        [self oneSignalReceivedRemoteNotification:application userInfo:userInfo];
}

// Fires when a notication is opened or recieved while the app is in focus.
//   - Also fires when the app is in the background and a notificaiton with content-available=1 is received.
// NOTE: completionHandler must only be called once!
//          iOS 10 - This crashes the app if it is called twice! Crash will happen when the app is resumed.
//          iOS 9  - Does not have this issue.
- (void) oneSignalRemoteSilentNotification:(UIApplication*)application UserInfo:(NSDictionary*)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult)) completionHandler {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalRemoteSilentNotification:UserInfo:fetchCompletionHandler:"];
    
    BOOL callExistingSelector = [self respondsToSelector:@selector(oneSignalRemoteSilentNotification:UserInfo:fetchCompletionHandler:)];
    BOOL startedBackgroundJob = false;
    
    if ([OneSignal app_id]) {
        if ([UIApplication sharedApplication].applicationState == UIApplicationStateActive && userInfo[@"aps"][@"alert"])
            [OneSignal notificationOpened:userInfo isActive:YES];
        else
            startedBackgroundJob = [OneSignal remoteSilentNotification:application UserInfo:userInfo completionHandler:callExistingSelector ? nil : completionHandler];
    }
    
    if (callExistingSelector) {
        [self oneSignalRemoteSilentNotification:application UserInfo:userInfo fetchCompletionHandler:completionHandler];
        return;
    }
    
    // Make sure not a cold start from tap on notification (OS doesn't call didReceiveRemoteNotification)
    if ([self respondsToSelector:@selector(oneSignalReceivedRemoteNotification:userInfo:)]
        && ![[OneSignal valueForKey:@"coldStartFromTapOnNotification"] boolValue])
        [self oneSignalReceivedRemoteNotification:application userInfo:userInfo];
    
    if (!startedBackgroundJob)
        completionHandler(UIBackgroundFetchResultNewData);
}

- (void) oneSignalLocalNotificationOpened:(UIApplication*)application handleActionWithIdentifier:(NSString*)identifier forLocalNotification:(UILocalNotification*)notification completionHandler:(void(^)()) completionHandler {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalLocalNotificationOpened:handleActionWithIdentifier:forLocalNotification:completionHandler:"];
    
    if ([OneSignal app_id])
        [OneSignal processLocalActionBasedNotification:notification identifier:identifier];
    
    if ([self respondsToSelector:@selector(oneSignalLocalNotificationOpened:handleActionWithIdentifier:forLocalNotification:completionHandler:)])
        [self oneSignalLocalNotificationOpened:application handleActionWithIdentifier:identifier forLocalNotification:notification completionHandler:completionHandler];
    
    completionHandler();
}

- (void)oneSignalLocalNotificationOpened:(UIApplication*)application notification:(UILocalNotification*)notification {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalLocalNotificationOpened:notification:"];
    
    if ([OneSignal app_id])
        [OneSignal processLocalActionBasedNotification:notification identifier:@"__DEFAULT__"];
    
    if([self respondsToSelector:@selector(oneSignalLocalNotificationOpened:notification:)])
        [self oneSignalLocalNotificationOpened:application notification:notification];
}

- (void)oneSignalApplicationWillResignActive:(UIApplication*)application {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalApplicationWillResignActive"];
    
    if ([OneSignal app_id])
        [OneSignalTracker onFocus:YES];
    
    if ([self respondsToSelector:@selector(oneSignalApplicationWillResignActive:)])
        [self oneSignalApplicationWillResignActive:application];
}

- (void) oneSignalApplicationDidEnterBackground:(UIApplication*)application {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalApplicationDidEnterBackground"];
    
    if ([OneSignal app_id])
        [OneSignalLocation onfocus:NO];
    
    if ([self respondsToSelector:@selector(oneSignalApplicationDidEnterBackground:)])
        [self oneSignalApplicationDidEnterBackground:application];
}

- (void)oneSignalApplicationDidBecomeActive:(UIApplication*)application {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:@"oneSignalApplicationDidBecomeActive"];
    
    if ([OneSignal app_id]) {
        [OneSignalTracker onFocus:NO];
        [OneSignalLocation onfocus:YES];
    }
    
    if ([self respondsToSelector:@selector(oneSignalApplicationDidBecomeActive:)])
        [self oneSignalApplicationDidBecomeActive:application];
}

-(void)oneSignalApplicationWillTerminate:(UIApplication *)application {
    
    if ([OneSignal app_id])
        [OneSignalTracker onFocus:YES];
    
    if ([self respondsToSelector:@selector(oneSignalApplicationWillTerminate:)])
        [self oneSignalApplicationWillTerminate:application];
}

@end

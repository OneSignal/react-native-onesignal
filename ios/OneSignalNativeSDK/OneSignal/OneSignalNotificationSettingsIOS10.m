/**
 * Modified MIT License
 *
 * Copyright 2017 OneSignal
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

#import "OneSignalNotificationSettingsIOS10.h"

#import "OneSignalInternal.h"

#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

#import "OneSignalHelper.h"

@implementation OneSignalNotificationSettingsIOS10 {

// Used as both an optimization and to prevent queue deadlocks.
// This doesn't seem to be required for the latter at this time. (2.4.3)
BOOL useCachedStatus;
}

// Used to run all calls to getNotificationSettingsWithCompletionHandler sequentially
//   This prevents any possible deadlocks due to race condiditions.
static dispatch_queue_t serialQueue;
+(dispatch_queue_t)getQueue {
    return serialQueue;
}

- (instancetype)init {
    serialQueue = dispatch_queue_create("com.onesignal.notification.settings.ios10", DISPATCH_QUEUE_SERIAL);
    return [super init];
}

- (void)getNotificationPermissionState:(void (^)(OSPermissionState *subcscriptionStatus))completionHandler {
    if (useCachedStatus) {
        completionHandler(OneSignal.currentPermissionState);
        return;
    }
    
    // NOTE1: Never call currentUserNotificationSettings from the callback below! It will lock the main thread.
    // NOTE2: Apple runs the callback on a background serial queue
    dispatch_async(serialQueue, ^{
        [[UNUserNotificationCenter currentNotificationCenter] getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings* settings) {
            OSPermissionState* status = OneSignal.currentPermissionState;
            
            status.accepted = settings.authorizationStatus == UNAuthorizationStatusAuthorized;
            status.answeredPrompt = settings.authorizationStatus != UNAuthorizationStatusNotDetermined;
            status.notificationTypes = (settings.badgeSetting == UNNotificationSettingEnabled ? 1 : 0)
                                     + (settings.soundSetting == UNNotificationSettingEnabled ? 2 : 0)
                                     + (settings.alertSetting == UNNotificationSettingEnabled ? 4 : 0)
                                     + (settings.lockScreenSetting == UNNotificationSettingEnabled ? 8 : 0);
            useCachedStatus = true;
            completionHandler(status);
            useCachedStatus = false;
        }];
    });
}

- (OSPermissionState*)getNotificationPermissionState {
    if (useCachedStatus)
        return OneSignal.currentPermissionState;
    
    __block OSPermissionState* returnStatus = OneSignal.currentPermissionState;
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
    dispatch_sync(serialQueue, ^{
        [self getNotificationPermissionState:^(OSPermissionState *status) {
            returnStatus = status;
            dispatch_semaphore_signal(semaphore);
        }];
    });
    dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    
    return returnStatus;
}

- (int)getNotificationTypes {
    return [self getNotificationPermissionState].notificationTypes;
}

// Prompt then run updateNotificationTypes on the main thread with the response.
// FUTURE: Add a 2nd seloctor with 'withOptions' for UNAuthorizationOptions*'s
- (void)promptForNotifications:(void(^)(BOOL accepted))completionHandler {
    
    id responseBlock = ^(BOOL granted, NSError* error) {
        // Run callback on main / UI thread
        [OneSignalHelper dispatch_async_on_main_queue: ^{
            OneSignal.currentPermissionState.accepted = granted;
            OneSignal.currentPermissionState.answeredPrompt = true;
            [OneSignal updateNotificationTypes: granted ? 15 : 0];
            if (completionHandler)
                completionHandler(granted);
        }];
    };
    
    UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert + UNAuthorizationOptionSound + UNAuthorizationOptionBadge)
                          completionHandler:responseBlock];
    
    [OneSignal registerForAPNsToken];
}

// Ignore these 2 events, promptForNotifications: already takes care of these.
// Only iOS 8 & 9
- (void)onNotificationPromptResponse:(int)notificationTypes { }
// Only iOS 7
- (void)onAPNsResponse:(BOOL)success {}

@end

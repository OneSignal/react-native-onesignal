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

#import <UIKit/UIKit.h>

#import "OneSignalNotificationSettingsIOS8.h"

#import "OneSignalInternal.h"

#define NOTIFICATION_TYPE_ALL 7

@implementation OneSignalNotificationSettingsIOS8 {
    void (^notificationPromptReponseCallback)(BOOL);
}

- (void)getNotificationPermissionState:(void (^)(OSPermissionState *subcscriptionStatus))completionHandler {
    NSUserDefaults* userDefaults = [NSUserDefaults standardUserDefaults];
    OSPermissionState* status = OneSignal.currentPermissionState;
    
    status.notificationTypes = [[UIApplication sharedApplication] currentUserNotificationSettings].types;
    status.accepted = status.notificationTypes > 0;
    status.answeredPrompt = [userDefaults boolForKey:@"OS_NOTIFICATION_PROMPT_ANSWERED"];
    
    completionHandler(status);
}

- (OSPermissionState*)getNotificationPermissionState {
    __block OSPermissionState* returnStatus = [OSPermissionState alloc];
    
    [self getNotificationPermissionState:^(OSPermissionState *status) {
        returnStatus = status;
    }];
    
    return returnStatus;
}

- (int) getNotificationTypes {
    return [[UIApplication sharedApplication] currentUserNotificationSettings].types;
}

#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

- (void)promptForNotifications:(void(^)(BOOL accepted))completionHandler {
    UIApplication* shardApp = [UIApplication sharedApplication];
    
    NSSet* categories = [[shardApp currentUserNotificationSettings] categories];
    [shardApp registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:NOTIFICATION_TYPE_ALL categories:categories]];
    
    notificationPromptReponseCallback = completionHandler;
    
    [OneSignal registerForAPNsToken];
}

- (void)onNotificationPromptResponse:(int)notificationTypes {
    BOOL accepted = notificationTypes > 0;
    
    if (notificationPromptReponseCallback) {
        notificationPromptReponseCallback(accepted);
        notificationPromptReponseCallback = nil;
    }
    
    OneSignal.currentPermissionState.accepted = accepted;
    OneSignal.currentPermissionState.answeredPrompt = true;
}

// Only iOS 7 - The above is used for iOS 8 & 9
- (void)onAPNsResponse:(BOOL)success {}

#pragma GCC diagnostic pop

@end

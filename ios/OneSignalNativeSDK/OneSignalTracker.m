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

#import <UIKit/UIKit.h>

#import "OneSignalTracker.h"
#import "OneSignalHelper.h"
#import "OneSignalHTTPClient.h"
#import "OneSignalWebView.h"

@interface OneSignal ()

+ (void)registerUser;
+ (void) sendNotificationTypesUpdate;
+ (BOOL) clearBadgeCount:(BOOL)fromNotifOpened;
+ (NSString*)mUserId;

@end

@implementation OneSignalTracker

NSNumber* unSentActiveTime;
UIBackgroundTaskIdentifier focusBackgroundTask;
NSTimeInterval lastOpenedTime;
BOOL lastOnFocusWasToBackground = YES;

+ (void) beginBackgroundFocusTask {
    focusBackgroundTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
        [OneSignalTracker endBackgroundFocusTask];
    }];
}

+ (void) endBackgroundFocusTask {
    [[UIApplication sharedApplication] endBackgroundTask: focusBackgroundTask];
    focusBackgroundTask = UIBackgroundTaskInvalid;
}

+ (void)onFocus:(BOOL)toBackground {
    
    //Prevent the onFocus to be called twice when app being terminated
    // (Both WillResignActive and willTerminate
    if (lastOnFocusWasToBackground == toBackground)
        return;
    lastOnFocusWasToBackground = toBackground;
    
    bool wasBadgeSet = false;
    
    NSTimeInterval now = [[NSDate date] timeIntervalSince1970];
    NSTimeInterval timeToPingWith = 0.0;
    
    
    if (!toBackground) {
        lastOpenedTime = now;
        [OneSignal sendNotificationTypesUpdate];
        wasBadgeSet = [OneSignal clearBadgeCount:false];
    }
    else {

        [[NSUserDefaults standardUserDefaults] setDouble:now forKey:@"GT_LAST_CLOSED_TIME"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        
        NSTimeInterval timeElapsed = now - lastOpenedTime + 0.5;
        if (timeElapsed < 0 || timeElapsed > 86400)
            return;
        
        NSTimeInterval unsentActive = [OneSignalTracker getUnsentActiveTime];
        NSTimeInterval totalTimeActive = unsentActive + timeElapsed;
        
        if (totalTimeActive < 30) {
            [OneSignalTracker saveUnsentActiveTime:totalTimeActive];
            return;
        }
        
        timeToPingWith = totalTimeActive;
        
    }
    
    if (![OneSignal mUserId])
        return;
    
    OneSignalHTTPClient * httpClient = [[OneSignalHTTPClient alloc] init];
    
    // If resuming and badge was set, clear it on the server as well.
    if (wasBadgeSet && !toBackground) {
        NSMutableURLRequest* request = [httpClient requestWithMethod:@"PUT" path:[NSString stringWithFormat:@"players/%@", [OneSignal mUserId]]];
        
        NSDictionary* dataDic = [NSDictionary dictionaryWithObjectsAndKeys:
                                 [OneSignal app_id], @"app_id",
                                 @0, @"badge_count",
                                 nil];
        
        NSData* postData = [NSJSONSerialization dataWithJSONObject:dataDic options:0 error:nil];
        [request setHTTPBody:postData];
        
        [OneSignalHelper enqueueRequest:request onSuccess:nil onFailure:nil];
        return;
    }
    
    // Update the playtime on the server when the app put into the background or the device goes to sleep mode.
    if (toBackground) {
        [OneSignalTracker saveUnsentActiveTime:0];
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
            [OneSignalTracker beginBackgroundFocusTask];
            
            NSMutableURLRequest* request = [httpClient requestWithMethod:@"POST" path:[NSString stringWithFormat:@"players/%@/on_focus", [OneSignal mUserId]]];
            NSDictionary* dataDic = [NSDictionary dictionaryWithObjectsAndKeys:
                                     [OneSignal app_id], @"app_id",
                                     @"ping", @"state",
                                     @1, @"type",
                                     @(timeToPingWith), @"active_time",
                                     [OneSignalHelper getNetType], @"net_type",
                                     nil];
            
            NSData* postData = [NSJSONSerialization dataWithJSONObject:dataDic options:0 error:nil];
            [request setHTTPBody:postData];
            
            // We are already running in a thread so send the request synchronous to keep the thread alive.
            [OneSignalHelper enqueueRequest:request
                                  onSuccess:nil
                                  onFailure:nil
                              isSynchronous:true];
            [OneSignalTracker endBackgroundFocusTask];
        });
    }
}

+ (NSTimeInterval)getUnsentActiveTime {
    if (unSentActiveTime == NULL) {
        unSentActiveTime = [NSNumber numberWithInteger:-1];
    }
    
    if ([unSentActiveTime intValue] == -1) {
        unSentActiveTime = [[NSUserDefaults standardUserDefaults] objectForKey:@"GT_UNSENT_ACTIVE_TIME"];
        if (unSentActiveTime == nil)
            unSentActiveTime = 0;
    }
    
    return [unSentActiveTime doubleValue];
}

+ (void)saveUnsentActiveTime:(NSTimeInterval)time {
    unSentActiveTime = @(time);
    [[NSUserDefaults standardUserDefaults] setObject:unSentActiveTime forKey:@"GT_UNSENT_ACTIVE_TIME"];
    [[NSUserDefaults standardUserDefaults] synchronize];
}

@end

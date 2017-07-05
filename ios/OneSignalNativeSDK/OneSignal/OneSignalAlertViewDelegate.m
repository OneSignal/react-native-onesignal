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

#import "OneSignalAlertViewDelegate.h"
#import "OneSignal.h"
#import "OneSignalHelper.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

@interface OneSignal ()
+ (void)handleNotificationOpened:(NSDictionary*)messageDict
                        isActive:(BOOL)isActive
                      actionType:(OSNotificationActionType)actionType
                     displayType:(OSNotificationDisplayType)displayType;
@end


@implementation OneSignalAlertView

+ (void)showInAppAlert:(NSDictionary*)messageDict {
    NSDictionary* titleAndBody = [OneSignalHelper getPushTitleBody:messageDict];
    id oneSignalAlertViewDelegate = [[OneSignalAlertViewDelegate alloc] initWithMessageDict:messageDict];
    
    UIAlertView* alertView = [[UIAlertView alloc] initWithTitle:titleAndBody[@"title"]
                                                        message:titleAndBody[@"body"]
                                                       delegate:oneSignalAlertViewDelegate
                                              cancelButtonTitle:NSLocalizedString(@"Close", nil)
                                              otherButtonTitles:nil, nil];
    // Add Buttons
    NSArray *actionButons = [OneSignalHelper getActionButtons:messageDict];
    if (actionButons) {
        for(id button in actionButons)
            [alertView addButtonWithTitle:button[@"n"] ?: button[@"text"]];
    }
    
    [alertView show];
    
    // Message received that was displayed (Foreground + InAppAlert is true)
    // Call Received Block
    [OneSignalHelper handleNotificationReceived:OSNotificationDisplayTypeInAppAlert];
}

@end


@implementation OneSignalAlertViewDelegate

NSDictionary* mMessageDict;

// delegateReference exist to keep ARC from cleaning up this object when it goes out of scope.
// This is becuase UIAlertView delegate is set to weak instead of strong
static NSMutableArray* delegateReference;

- (id)initWithMessageDict:(NSDictionary*)messageDict {
    mMessageDict = messageDict;
    
    if (delegateReference == nil)
        delegateReference = [NSMutableArray array];
    
    [delegateReference addObject:self];
    
    return self;
}

- (void)alertView:(UIAlertView*)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    
    OSNotificationActionType actionType = OSNotificationActionTypeOpened;
    
    if (buttonIndex != 0) {
        
        actionType = OSNotificationActionTypeActionTaken;
        
        NSMutableDictionary* userInfo = [mMessageDict mutableCopy];

        if (mMessageDict[@"os_data"]) {
            if ([mMessageDict[@"os_data"][@"buttons"] isKindOfClass:[NSDictionary class]])
                userInfo[@"actionSelected"] = mMessageDict[@"os_data"][@"buttons"][@"o"][buttonIndex - 1][@"i"];
            else
                userInfo[@"actionSelected"] = mMessageDict[@"os_data"][@"buttons"][buttonIndex - 1][@"i"];
        }
        else if (mMessageDict[@"buttons"])
             userInfo[@"actionSelected"] = mMessageDict[@"buttons"][buttonIndex - 1][@"i"];
        else {
            NSMutableDictionary* customDict = [userInfo[@"custom"] mutableCopy];
            NSMutableDictionary* additionalData = [[NSMutableDictionary alloc] initWithDictionary:customDict[@"a"]];
            
            if([additionalData[@"actionButtons"] isKindOfClass:[NSArray class]])
                additionalData[@"actionSelected"] = additionalData[@"actionButtons"][buttonIndex - 1][@"id"];
                
            else if([mMessageDict[@"o"] isKindOfClass:[NSArray class]])
                additionalData[@"actionSelected"] = mMessageDict[@"o"][buttonIndex -1][@"i"];
            
            customDict[@"a"] = additionalData;
            userInfo[@"custom"] = customDict;
        }
        
        mMessageDict = userInfo;
    }
    
    [OneSignal handleNotificationOpened:mMessageDict isActive:YES actionType:actionType displayType:OSNotificationDisplayTypeInAppAlert];
    
    [delegateReference removeObject:self];
}

@end

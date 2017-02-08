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
#import <Foundation/Foundation.h>

#import <CommonCrypto/CommonDigest.h>

#import "OneSignalReachability.h"
#import "OneSignalHelper.h"

#import <objc/runtime.h>


#define NOTIFICATION_TYPE_ALL 7
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wundeclared-selector"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

@interface UIApplication (Swizzling)
+(Class)delegateClass;
@end

@implementation OSNotificationAction
@synthesize type = _type, actionID = _actionID;

-(id)initWithActionType:(OSNotificationActionType)type :(NSString*)actionID {
    self = [super init];
    if(self) {
        _type = type;
        _actionID = actionID;
    }
    return self;
}

@end

@implementation OSNotificationPayload
@synthesize actionButtons = _actionButtons, additionalData = _additionalData, badge = _badge, body = _body, contentAvailable = _contentAvailable, notificationID = _notificationID, launchURL = _launchURL, rawPayload = _rawPayload, sound = _sound, subtitle = _subtitle, title = _title, attachments = _attachments;

- (id)initWithRawMessage:(NSDictionary*)message {
    self = [super init];
    if (self && message) {
        _rawPayload = [NSDictionary dictionaryWithDictionary:message];
        
        if (_rawPayload[@"aps"][@"content-available"])
            _contentAvailable = (BOOL)_rawPayload[@"aps"][@"content-available"];
        else
            _contentAvailable = NO;
        
        if (_rawPayload[@"aps"][@"badge"])
            _badge = [_rawPayload[@"aps"][@"badge"] intValue];
        else
            _badge = [_rawPayload[@"badge"] intValue];
        
        _actionButtons = _rawPayload[@"o"];
        if (!_actionButtons)
            _actionButtons = _rawPayload[@"os_data"][@"buttons"][@"o"];
        
        if(_rawPayload[@"aps"][@"sound"])
            _sound = _rawPayload[@"aps"][@"sound"];
        else if(_rawPayload[@"s"])
            _sound = _rawPayload[@"s"];
        else
            _sound = _rawPayload[@"os_data"][@"buttons"][@"s"];
        
        if(_rawPayload[@"custom"]) {
            NSDictionary * custom = _rawPayload[@"custom"];
            if (custom[@"a"])
                _additionalData = [custom[@"a"] copy];
            _notificationID = custom[@"i"];
            _launchURL = custom[@"u"];
            
            _attachments = [_rawPayload[@"at"] copy];
        }
        else if(_rawPayload[@"os_data"]) {
            NSDictionary * os_data = _rawPayload[@"os_data"];
            
            NSMutableDictionary *additional = [_rawPayload mutableCopy];
            [additional removeObjectForKey:@"aps"];
            [additional removeObjectForKey:@"os_data"];
            _additionalData = [[NSDictionary alloc] initWithDictionary:additional];
            
            _notificationID = os_data[@"i"];
            _launchURL = os_data[@"u"];
            
            if(os_data[@"buttons"][@"at"])
                _attachments = [os_data[@"buttons"][@"at"] copy];
        }
        
        if(_rawPayload[@"m"]) {
            id m = _rawPayload[@"m"];
            if ([m isKindOfClass:[NSDictionary class]]) {
                _body = m[@"body"];
                _title = m[@"title"];
                _subtitle = m[@"subtitle"];
            }
            else
                _body = m;
        }
        else if(_rawPayload[@"aps"][@"alert"]) {
            id a = message[@"aps"][@"alert"];
            if ([a isKindOfClass:[NSDictionary class]]) {
                _body = a[@"body"];
                _title = a[@"title"];
                _subtitle = a[@"subtitle"];
            }
            else
                _body = a;
        }
        else if(_rawPayload[@"os_data"][@"buttons"][@"m"]) {
            NSDictionary * m = _rawPayload[@"os_data"][@"buttons"][@"m"];
            _body = m[@"body"];
            _title = m[@"title"];
            _subtitle = m[@"subtitle"];
        }
    }
    
    return self;
}
@end

@implementation OSNotification
@synthesize payload = _payload, shown = _shown, isAppInFocus = _isAppInFocus, silentNotification = _silentNotification, displayType = _displayType;

#if XC8_AVAILABLE
@synthesize mutableContent = _mutableContent;
#endif

- (id)initWithPayload:(OSNotificationPayload *)payload displayType:(OSNotificationDisplayType)displayType {
    self = [super init];
    if (self) {
        _payload = payload;
        
        _displayType = displayType;
        
        _silentNotification = [OneSignalHelper isRemoteSilentNotification:payload.rawPayload];
        
#if XC8_AVAILABLE
        _mutableContent = payload.rawPayload[@"aps"][@"mutable-content"] && [payload.rawPayload[@"aps"][@"mutable-content"] isEqual: @YES];
#endif
        
        _shown = true;
        
        _isAppInFocus = [[UIApplication sharedApplication] applicationState] == UIApplicationStateActive;
        
        //If remote silent -> shown = false
        //If app is active and in-app alerts are not enabled -> shown = false
        if (_silentNotification ||
            (_isAppInFocus && [[NSUserDefaults standardUserDefaults] boolForKey:@"ONESIGNAL_ALERT_OPTION"] == OSNotificationDisplayTypeNone))
            _shown = false;
        
    }
    return self;
}

- (NSString*)stringify {
    
    NSMutableDictionary * obj = [NSMutableDictionary new];
    [obj setObject:[NSMutableDictionary new] forKeyedSubscript:@"payload"];
    if(self.payload.notificationID)
        [obj[@"payload"] setObject:self.payload.notificationID forKeyedSubscript: @"notificationID"];
    
    if(self.payload.sound)
        [obj[@"payload"] setObject:self.payload.sound forKeyedSubscript: @"sound"];
    
    if(self.payload.title)
        [obj[@"payload"] setObject:self.payload.title forKeyedSubscript: @"title"];
    
    if(self.payload.body)
        [obj[@"payload"] setObject:self.payload.body forKeyedSubscript: @"body"];
    
    if(self.payload.subtitle)
        [obj[@"payload"] setObject:self.payload.subtitle forKeyedSubscript: @"subtitle"];
    
    if(self.payload.additionalData)
        [obj[@"payload"] setObject:self.payload.additionalData forKeyedSubscript: @"additionalData"];
    
    if(self.payload.actionButtons)
        [obj[@"payload"] setObject:self.payload.actionButtons forKeyedSubscript: @"actionButtons"];
    
    if(self.payload.rawPayload)
        [obj[@"payload"] setObject:self.payload.rawPayload forKeyedSubscript: @"rawPayload"];
    
    if(self.payload.launchURL)
        [obj[@"payload"] setObject:self.payload.launchURL forKeyedSubscript: @"launchURL"];
    
    if(self.payload.contentAvailable)
        [obj[@"payload"] setObject:@(self.payload.contentAvailable) forKeyedSubscript: @"contentAvailable"];
    
    if(self.payload.badge)
        [obj[@"payload"] setObject:@(self.payload.badge) forKeyedSubscript: @"badge"];
    
    if(self.displayType)
        [obj setObject:@(self.displayType) forKeyedSubscript: @"displayType"];
    
    
    [obj setObject:@(self.shown) forKeyedSubscript: @"shown"];
    [obj setObject:@(self.isAppInFocus) forKeyedSubscript: @"isAppInFocus"];
    
    if (self.silentNotification)
        [obj setObject:@(self.silentNotification) forKeyedSubscript: @"silentNotification"];
    
    
    //Convert obj into a serialized
    NSError * err;
    NSData * jsonData = [NSJSONSerialization  dataWithJSONObject:obj options:0 error:&err];
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

@end

@implementation OSNotificationOpenedResult
@synthesize notification = _notification, action = _action;

- (id)initWithNotification:(OSNotification*)notification action:(OSNotificationAction*)action {
    self = [super init];
    if(self) {
        _notification = notification;
        _action = action;
    }
    return self;
}

- (NSString*)stringify {
    
    NSError * jsonError = nil;
    NSData *objectData = [[self.notification stringify] dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *notifDict = [NSJSONSerialization JSONObjectWithData:objectData
                                                              options:NSJSONReadingMutableContainers
                                                                error:&jsonError];
    
    NSMutableDictionary* obj = [NSMutableDictionary new];
    NSMutableDictionary* action = [NSMutableDictionary new];
    [action setObject:self.action.actionID forKeyedSubscript:@"actionID"];
    [obj setObject:action forKeyedSubscript:@"action"];
    [obj setObject:notifDict forKeyedSubscript:@"notification"];
    if(self.action.type)
        [obj[@"action"] setObject:@(self.action.type) forKeyedSubscript: @"type"];
    
    //Convert obj into a serialized
    NSError * err;
    NSData * jsonData = [NSJSONSerialization  dataWithJSONObject:obj options:0 error:&err];
    return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
}

@end

@implementation OneSignalHelper

UIBackgroundTaskIdentifier mediaBackgroundTask;

+ (void) beginBackgroundMediaTask {
    mediaBackgroundTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
        [OneSignalHelper endBackgroundMediaTask];
    }];
}

+ (void) endBackgroundMediaTask {
    [[UIApplication sharedApplication] endBackgroundTask: mediaBackgroundTask];
    mediaBackgroundTask = UIBackgroundTaskInvalid;
}




OneSignalWebView *webVC;
NSDictionary* lastMessageReceived;
OSHandleNotificationReceivedBlock handleNotificationReceived;
OSHandleNotificationActionBlock handleNotificationAction;

//Passed to the OnFocus to make sure dismissed when coming back into app
+(OneSignalWebView*)webVC {
    return webVC;
}


+ (BOOL) isRemoteSilentNotification:(NSDictionary*)msg {
    //no alert, sound, or badge payload
    if(msg[@"badge"] || msg[@"aps"][@"badge"] || msg[@"m"] || msg[@"o"] || msg[@"s"] || (msg[@"title"] && [msg[@"title"] length] > 0) || msg[@"sound"] || msg[@"aps"][@"sound"] || msg[@"aps"][@"alert"] || msg[@"os_data"][@"buttons"])
        return false;
    return true;
}

+ (void)lastMessageReceived:(NSDictionary*)message {
    lastMessageReceived = message;
}

+ (void)notificationBlocks:(OSHandleNotificationReceivedBlock)receivedBlock :(OSHandleNotificationActionBlock)actionBlock {
    handleNotificationReceived = receivedBlock;
    handleNotificationAction = actionBlock;
}

+ (NSString*)md5:(NSString *)text {
    return NULL;
}

+ (NSArray*)getActionButtons:(NSDictionary*)messageDict {
    if (messageDict[@"os_data"] && [messageDict[@"os_data"] isKindOfClass:[NSDictionary class]])
        return messageDict[@"os_data"][@"buttons"][@"o"];
    
    return messageDict[@"o"];
}

+ (NSDictionary*)getPushTitleBody:(NSDictionary*)messageDict {
    
    NSString *title;
    if ([messageDict[@"aps"][@"alert"] isKindOfClass:[NSDictionary class]])
        title = messageDict[@"aps"][@"alert"][@"title"];
    else
        title = messageDict[@"aps"][@"alert"];
    
    if (!title) {
        if ([messageDict[@"m"] isKindOfClass:[NSDictionary class]])
            title = messageDict[@"m"][@"title"];
    }
    
    if (!title) {
        if ([messageDict[@"os_data"][@"buttons"][@"m"] isKindOfClass:[NSDictionary class]])
            title = messageDict[@"os_data"][@"buttons"][@"m"][@"title"];
    }
    
    if (!title)
        title = [[[NSBundle mainBundle] infoDictionary] objectForKey:(id)kCFBundleNameKey];
    if (!title)
        title = @"";
    
    
    NSString *subtitle;
    if ([messageDict[@"aps"][@"alert"] isKindOfClass:[NSDictionary class]])
        subtitle = messageDict[@"aps"][@"alert"][@"subtitle"];
    else
        subtitle = messageDict[@"aps"][@"alert"];
    
    if (!subtitle) {
        if ([messageDict[@"m"] isKindOfClass:[NSDictionary class]])
            subtitle = messageDict[@"m"][@"subtitle"];
    }
    
    if (!subtitle) {
        if ([messageDict[@"os_data"][@"buttons"][@"m"] isKindOfClass:[NSDictionary class]])
            subtitle = messageDict[@"os_data"][@"buttons"][@"m"][@"subtitle"];
    }
    
    if (!subtitle)
        subtitle = @"";
    
    
    
    NSString *body;
    if ([messageDict[@"aps"][@"alert"] isKindOfClass:[NSDictionary class]])
        body = messageDict[@"aps"][@"alert"][@"body"];
    else
        body = messageDict[@"aps"][@"alert"];
    
    if (!body) {
        if ([messageDict[@"m"] isKindOfClass:[NSDictionary class]])
            body = messageDict[@"m"][@"body"];
        else
            body = messageDict[@"m"];
    }
    
    if (!body) {
        if ([messageDict[@"os_data"][@"buttons"][@"m"] isKindOfClass:[NSDictionary class]])
            body = messageDict[@"os_data"][@"buttons"][@"m"][@"body"];
        else
            body = messageDict[@"os_data"][@"buttons"][@"m"];
    }
    
    if (!body)
        body = @"";
    
    return @{@"title" : title, @"subtitle": subtitle, @"body": body};
}


+ (NSMutableDictionary*) formatApsPayloadIntoStandard:(NSDictionary*)remoteUserInfo identifier:(NSString*)identifier {
    NSMutableDictionary* userInfo, *customDict, *additionalData, *optionsDict;
    
    if (remoteUserInfo[@"os_data"][@"buttons"]) {
        userInfo = [remoteUserInfo mutableCopy];
        additionalData = [NSMutableDictionary dictionary];
        optionsDict = userInfo[@"os_data"][@"buttons"][@"o"];
    }
    else if (remoteUserInfo[@"custom"]) {
        userInfo = [remoteUserInfo mutableCopy];
        customDict = [userInfo[@"custom"] mutableCopy];
        additionalData = [[NSMutableDictionary alloc] initWithDictionary:customDict[@"a"]];
        optionsDict = userInfo[@"o"];
    }
    else
        return nil;
    
    NSMutableArray* buttonArray = [[NSMutableArray alloc] init];
    for (NSDictionary* button in optionsDict) {
        [buttonArray addObject: @{@"text" : button[@"n"],
                                  @"id" : (button[@"i"] ? button[@"i"] : button[@"n"])}];
    }
    additionalData[@"actionSelected"] = identifier;
    additionalData[@"actionButtons"] = buttonArray;
    
    if (remoteUserInfo[@"os_data"]) {
        [userInfo addEntriesFromDictionary:additionalData];
        userInfo[@"aps"] = @{@"alert" : userInfo[@"os_data"][@"buttons"][@"m"]};
    }
    else {
        customDict[@"a"] = additionalData;
        userInfo[@"custom"] = customDict;
        
        if(userInfo[@"m"])
            userInfo[@"aps"] = @{@"alert" : userInfo[@"m"]};
    }
    
    return userInfo;
}


// Prevent the OSNotification blocks from firing if we receive a Non-OneSignal remote push
+ (BOOL)isOneSignalPayload {
    if (!lastMessageReceived)
        return NO;
    return lastMessageReceived[@"custom"][@"i"] || lastMessageReceived[@"os_data"][@"i"];
}

+ (void)handleNotificationReceived:(OSNotificationDisplayType)displayType {
    if (!handleNotificationReceived || ![self isOneSignalPayload])
        return;
    
    OSNotificationPayload *payload = [[OSNotificationPayload alloc] initWithRawMessage:lastMessageReceived];
    OSNotification *notification = [[OSNotification alloc] initWithPayload:payload displayType:displayType];
    
    // Prevent duplicate calls to same receive event
    static NSString* lastMessageID = @"";
    if ([payload.notificationID isEqualToString:lastMessageID])
        return;
    lastMessageID = payload.notificationID;
    
    handleNotificationReceived(notification);
}

+ (void)handleNotificationAction:(OSNotificationActionType)actionType actionID:(NSString*)actionID displayType:(OSNotificationDisplayType)displayType {
    if (!handleNotificationAction || ![self isOneSignalPayload])
        return;
    
    OSNotificationAction *action = [[OSNotificationAction alloc] initWithActionType:actionType :actionID];
    OSNotificationPayload *payload = [[OSNotificationPayload alloc] initWithRawMessage:lastMessageReceived];
    OSNotification *notification = [[OSNotification alloc] initWithPayload:payload displayType:displayType];
    OSNotificationOpenedResult * result = [[OSNotificationOpenedResult alloc] initWithNotification:notification action:action];
    
    // Prevent duplicate calls to same action
    static NSString* lastMessageID = @"";
    if ([payload.notificationID isEqualToString:lastMessageID])
        return;
    lastMessageID = payload.notificationID;
    
    handleNotificationAction(result);
}

+(NSNumber*)getNetType {
    OneSignalReachability* reachability = [OneSignalReachability reachabilityForInternetConnection];
    NetworkStatus status = [reachability currentReachabilityStatus];
    if (status == ReachableViaWiFi)
        return @0;
    return @1;
}

+ (BOOL) isCapableOfGettingNotificationTypes {
    return [[UIApplication sharedApplication] respondsToSelector:@selector(currentUserNotificationSettings)];
}

+ (UILocalNotification*)createUILocalNotification:(NSDictionary*)data {
    
    UILocalNotification * notification = [[UILocalNotification alloc] init];
    
    id category = [[NSClassFromString(@"UIMutableUserNotificationCategory") alloc] init];
    [category setIdentifier:@"__dynamic__"];
    
    Class UIMutableUserNotificationActionClass = NSClassFromString(@"UIMutableUserNotificationAction");
    NSMutableArray* actionArray = [[NSMutableArray alloc] init];
    for (NSDictionary* button in [OneSignalHelper getActionButtons:data]) {
        id action = [[UIMutableUserNotificationActionClass alloc] init];
        [action setTitle:button[@"n"]];
        [action setIdentifier:button[@"i"] ? button[@"i"] : [action title]];
        [action setActivationMode:UIUserNotificationActivationModeForeground];
        [action setDestructive:NO];
        [action setAuthenticationRequired:NO];
        
        [actionArray addObject:action];
        // iOS 8 shows notification buttons in reverse in all cases but alerts. This flips it so the frist button is on the left.
        if (actionArray.count == 2)
            [category setActions:@[actionArray[1], actionArray[0]] forContext:UIUserNotificationActionContextMinimal];
    }
    
    [category setActions:actionArray forContext:UIUserNotificationActionContextDefault];
    
    Class uiUserNotificationSettings = NSClassFromString(@"UIUserNotificationSettings");
    NSUInteger notificationTypes = NOTIFICATION_TYPE_ALL;
    
    NSSet* currentCategories = [[[UIApplication sharedApplication] currentUserNotificationSettings] categories];
    if (currentCategories)
        currentCategories = [currentCategories setByAddingObject:category];
    else
        currentCategories = [NSSet setWithObject:category];
    
    [[UIApplication sharedApplication] registerUserNotificationSettings:[uiUserNotificationSettings settingsForTypes:notificationTypes categories:currentCategories]];
    notification.category = [category identifier];
    return notification;
}

+ (UILocalNotification*)prepareUILocalNotification:(NSDictionary*)data :(NSDictionary*)userInfo {
    
    UILocalNotification * notification = [self createUILocalNotification:data];
    
    if ([data[@"m"] isKindOfClass:[NSDictionary class]]) {
        if ([notification respondsToSelector:NSSelectorFromString(@"alertTitle")])
            [notification setValue:data[@"m"][@"title"] forKey:@"alertTitle"]; // Using reflection for pre-Xcode 6.2 support.
        notification.alertBody = data[@"m"][@"body"];
    }
    else
        notification.alertBody = data[@"m"];
    
    notification.userInfo = userInfo;
    notification.soundName = data[@"s"];
    if (notification.soundName == nil)
        notification.soundName = UILocalNotificationDefaultSoundName;
    if (data[@"b"])
        notification.applicationIconBadgeNumber = [data[@"b"] intValue];
    
    return notification;
}

//Shared instance as OneSignal is delegate of UNUserNotificationCenterDelegate and CLLocationManagerDelegate
static OneSignal* singleInstance = nil;
+(OneSignal*) sharedInstance {
    @synchronized( singleInstance ) {
        if( !singleInstance ) {
            singleInstance = [[OneSignal alloc] init];
        }
    }
    
    return singleInstance;
}

+ (BOOL)isiOS10Plus {
    return [[[UIDevice currentDevice] systemVersion] floatValue] >= 10.0 ;
}

+(NSString*)randomStringWithLength:(int)length {
    
    const NSString * letters = @"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    NSMutableString *randomString = [[NSMutableString alloc] initWithCapacity:length];
    for(int i = 0; i < length; i++) {
        uint32_t ln = (uint32_t)[letters length];
        uint32_t rand = arc4random_uniform(ln);
        [randomString appendFormat:@"%C", [letters characterAtIndex:rand]];
    }
    return randomString;
}

#if XC8_AVAILABLE

+ (void)registerAsUNNotificationCenterDelegate {
    Class UNNofiCenterClass = NSClassFromString(@"UNUserNotificationCenter");
    UNUserNotificationCenter *curNotifCenter = [UNNofiCenterClass currentNotificationCenter];
    if (!curNotifCenter.delegate)
        curNotifCenter.delegate = (id)[self sharedInstance];
}

+ (id)prepareUNNotificationRequest:(NSDictionary *)data :(NSDictionary *)userInfo {
    
    if (!NSClassFromString(@"UNNotificationAction") || !NSClassFromString(@"UNNotificationRequest"))
        return NULL;
    
    NSMutableArray * actionArray = [[NSMutableArray alloc] init];
    for(NSDictionary* button in [OneSignalHelper getActionButtons:data]) {
        NSString* title = button[@"n"] != NULL ? button[@"n"] : @"";
        NSString* buttonID = button[@"i"] != NULL ? button[@"i"] : title;
        id action = [NSClassFromString(@"UNNotificationAction") actionWithIdentifier:buttonID title:title options:UNNotificationActionOptionForeground];
        [actionArray addObject:action];
    }
    
    if ([actionArray count] == 2)
        actionArray = (NSMutableArray*)[[actionArray reverseObjectEnumerator] allObjects];
    
    id category = [NSClassFromString(@"UNNotificationCategory") categoryWithIdentifier:@"__dynamic__" actions:actionArray intentIdentifiers:@[] options:UNNotificationCategoryOptionCustomDismissAction];
    
    NSSet* set = [[NSSet alloc] initWithArray:@[category]];
    
    [[NSClassFromString(@"UNUserNotificationCenter") currentNotificationCenter] setNotificationCategories:set];
    
    id content = [[NSClassFromString(@"UNMutableNotificationContent") alloc] init];
    [content setValue:@"__dynamic__" forKey:@"categoryIdentifier"];
    
    NSDictionary* alertDict = [OneSignalHelper getPushTitleBody:data];
    [content setValue:alertDict[@"title"] forKey:@"title"];
    [content setValue:alertDict[@"subtitle"] forKey:@"subtitle"];
    [content setValue:alertDict[@"body"] forKey:@"body"];
    
    [content setValue:userInfo forKey:@"userInfo"];
    
    if (data[@"s"]) {
        id defaultSound = [NSClassFromString(@"UNNotificationSound") performSelector:@selector(soundNamed:) withObject:data[@"s"]];
        [content setValue:defaultSound forKey:@"sound"];
    }
    else
        [content setValue:[NSClassFromString(@"UNNotificationSound") performSelector:@selector(defaultSound)] forKey:@"sound"];
    
    [content setValue:data[@"b"] forKey:@"badge"];
    
    //Check if media attached
    NSMutableArray *attachments = [NSMutableArray new];
    NSDictionary * att = userInfo[@"at"];
    if(!att && userInfo[@"os_data"][@"buttons"])
        att = userInfo[@"os_data"][@"buttons"][@"at"];
    
    for(id key in att) {
        NSString * URI = [att valueForKey:key];
        
        /* Remote Object */
        if ([self verifyURL:URI]) {
            /* Synchroneously download file and chache it */
            NSString* name = [OneSignalHelper downloadMediaAndSaveInBundle:URI];
            if (!name)
                continue;
            NSArray* paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
            NSString* filePath = [paths[0] stringByAppendingPathComponent:name];
            NSURL* url = [NSURL fileURLWithPath:filePath];
            NSError* error;
            id attachment = [NSClassFromString(@"UNNotificationAttachment") attachmentWithIdentifier:key URL:url options:0 error:&error];
            if (attachment)
                [attachments addObject:attachment];
        }
        /* Local in bundle resources */
        else {
            NSMutableArray* files = [[NSMutableArray alloc] initWithArray:[URI componentsSeparatedByString:@"."]];
            if ([files count] < 2) continue;
            NSString* extension = [files lastObject];
            [files removeLastObject];
            NSString * name = [files componentsJoinedByString:@"."];
            //Make sure resource exists
            NSURL * url = [[NSBundle mainBundle] URLForResource:name withExtension:extension];
            if (url) {
                NSError *error;
                id attachment = [NSClassFromString(@"UNNotificationAttachment") attachmentWithIdentifier:key URL:url options:0 error:&error];
                if (attachment)
                    [attachments addObject:attachment];
            }
        }
    }
    
    [content setValue:attachments forKey:@"attachments"];
    
    id trigger = [NSClassFromString(@"UNTimeIntervalNotificationTrigger") triggerWithTimeInterval:0.25 repeats:NO];
    
    return [NSClassFromString(@"UNNotificationRequest") requestWithIdentifier:[self randomStringWithLength:16] content:content trigger:trigger];
}

+ (void)addnotificationRequest:(NSDictionary *)data userInfo:(NSDictionary *)userInfo completionHandler:(void (^)(UIBackgroundFetchResult))completionHandler {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [OneSignalHelper beginBackgroundMediaTask];
        id notificationRequest = [OneSignalHelper prepareUNNotificationRequest:data :userInfo];
        [[NSClassFromString(@"UNUserNotificationCenter") currentNotificationCenter] addNotificationRequest:notificationRequest withCompletionHandler:^(NSError * _Nullable error) {}];
        if (completionHandler)
            completionHandler(UIBackgroundFetchResultNewData);
        [OneSignalHelper endBackgroundMediaTask];
    });

}

// Synchroneously downloads a media
// On success returns bundle resource name, otherwise returns nil
+(NSString*) downloadMediaAndSaveInBundle:(NSString*) url {
    
    NSArray<NSString*>* supportedExtensions = @[@"aiff", @"wav", @"mp3", @"mp4", @"jpg", @"jpeg", @"png", @"gif", @"mpeg", @"mpg", @"avi", @"m4a", @"m4v"];
    NSArray* components = [url componentsSeparatedByString:@"."];
    
    // URL is not to a file
    if ([components count] < 2)
        return NULL;
    NSString* extension = [components lastObject];
    
    // Unrecognized extention
    if (![supportedExtensions containsObject:extension])
        return NULL;
    
    NSURL * URL = [NSURL URLWithString:url];
    NSData * data = [NSData dataWithContentsOfURL:URL];
    NSString *name = [[self randomStringWithLength:10] stringByAppendingString:[NSString stringWithFormat:@".%@", extension]];
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
    NSString* filePath = [paths[0] stringByAppendingPathComponent:name];
    NSError* error;
    [data writeToFile:filePath options:NSDataWritingAtomic error:&error];
    NSArray * cachedFiles = [[NSUserDefaults standardUserDefaults] objectForKey:@"CACHED_MEDIA"];
    NSMutableArray* appendedCache;
    if (cachedFiles) {
        appendedCache = [[NSMutableArray alloc] initWithArray:cachedFiles];
        [appendedCache addObject:name];
    }
    else
        appendedCache = [[NSMutableArray alloc] initWithObjects:name, nil];
    
    [[NSUserDefaults standardUserDefaults] setObject:appendedCache forKey:@"CACHED_MEDIA"];
    [[NSUserDefaults standardUserDefaults] synchronize];
    return name;
}

+(void)clearCachedMedia {
    NSArray* cachedFiles = [[NSUserDefaults standardUserDefaults] objectForKey:@"CACHED_MEDIA"];
    if (cachedFiles) {
        NSArray * paths = NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES);
        for (NSString* file in cachedFiles) {
            NSString* filePath = [paths[0] stringByAppendingPathComponent:file];
            NSError* error;
            [[NSFileManager defaultManager] removeItemAtPath:filePath error:&error];
        }
        [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"CACHED_MEDIA"];
    }
}

#endif

+ (BOOL)verifyURL:(NSString *)urlString {
    if (urlString) {
        NSURL* url = [NSURL URLWithString:urlString];
        if (url)
            return YES;
    }
    
    return NO;
}

+ (void)enqueueRequest:(NSURLRequest*)request onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock {
    [self enqueueRequest:request onSuccess:successBlock onFailure:failureBlock isSynchronous:false];
}

+ (void)enqueueRequest:(NSURLRequest*)request onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock isSynchronous:(BOOL)isSynchronous {
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:[NSString stringWithFormat:@"network request to: %@", request.URL]];
    [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:[NSString stringWithFormat:@"request.body: %@", [[NSString alloc] initWithData:request.HTTPBody encoding:NSUTF8StringEncoding]]];
    
    if (isSynchronous) {
        NSURLResponse* response = nil;
        NSError* error = nil;
        
        [NSURLConnection sendSynchronousRequest:request
                              returningResponse:&response
                                          error:&error];
        
        [OneSignalHelper handleJSONNSURLResponse:response data:nil error:error onSuccess:successBlock onFailure:failureBlock];
    }
    else {
        [NSURLConnection
         sendAsynchronousRequest:request
         queue:[[NSOperationQueue alloc] init]
         completionHandler:^(NSURLResponse* response,
                             NSData* data,
                             NSError* error) {
             [OneSignalHelper handleJSONNSURLResponse:response data:data error:error onSuccess:successBlock onFailure:failureBlock];
         }];
    }
}

+ (void)handleJSONNSURLResponse:(NSURLResponse*) response data:(NSData*) data error:(NSError*) error onSuccess:(OSResultSuccessBlock)successBlock onFailure:(OSFailureBlock)failureBlock {
    
    NSHTTPURLResponse* HTTPResponse = (NSHTTPURLResponse*)response;
    NSInteger statusCode = [HTTPResponse statusCode];
    NSError* jsonError = nil;
    NSMutableDictionary* innerJson;
    
    if (data != nil && [data length] > 0) {
        innerJson = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&jsonError];
        [OneSignal onesignal_Log:ONE_S_LL_VERBOSE message:[NSString stringWithFormat:@"network response: %@", innerJson]];
        if (jsonError) {
            if (failureBlock != nil)
                failureBlock([NSError errorWithDomain:@"OneSignal Error" code:statusCode userInfo:@{@"returned" : jsonError}]);
            return;
        }
    }
    
    if (error == nil && statusCode == 200) {
        if (successBlock != nil) {
            if (innerJson != nil)
                successBlock(innerJson);
            else
                successBlock(nil);
        }
    }
    else if (failureBlock != nil) {
        if (innerJson != nil && error == nil)
            failureBlock([NSError errorWithDomain:@"OneSignalError" code:statusCode userInfo:@{@"returned" : innerJson}]);
        else if (error != nil)
            failureBlock([NSError errorWithDomain:@"OneSignalError" code:statusCode userInfo:@{@"error" : error}]);
        else
            failureBlock([NSError errorWithDomain:@"OneSignalError" code:statusCode userInfo:nil]);
    }
}

+ (void) displayWebView:(NSURL*)url {
    
    // Check if in-app or safari
    BOOL inAppLaunch = YES;
    if( ![[NSUserDefaults standardUserDefaults] objectForKey:@"ONESIGNAL_INAPP_LAUNCH_URL"]) {
        [[NSUserDefaults standardUserDefaults] setObject:@YES forKey:@"ONESIGNAL_INAPP_LAUNCH_URL"];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
    
    inAppLaunch = [[[NSUserDefaults standardUserDefaults] objectForKey:@"ONESIGNAL_INAPP_LAUNCH_URL"] boolValue];
    NSString* urlScheme = [url.scheme lowercaseString];
    BOOL isWWWScheme = [urlScheme isEqualToString:@"http"] || [urlScheme isEqualToString:@"https"];
    
    if (inAppLaunch && isWWWScheme) {
        if (!webVC)
            webVC = [[OneSignalWebView alloc] init];
        webVC.url = url;
        [webVC showInApp];
    }
    else {
        // Keep dispatch_async. Without this the url can take an extra 2 to 10 secounds to open.
        dispatch_async(dispatch_get_main_queue(), ^{
            [[UIApplication sharedApplication] openURL:url];
        });
    }
    
}

+ (void) runOnMainThread:(void(^)())block {
    if ([NSThread isMainThread])
        block();
    else
        dispatch_sync(dispatch_get_main_queue(), block);
}

+ (BOOL) isValidEmail:(NSString*)email {
    NSError *error = NULL;
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$"
                                                                           options:NSRegularExpressionCaseInsensitive
                                                                             error:&error];
    NSUInteger numberOfMatches = [regex numberOfMatchesInString:email
                                                        options:0
                                                          range:NSMakeRange(0, [email length])];
    return numberOfMatches != 0;
}

+ (NSString*)hashUsingSha1:(NSString*)string {
    const char *cstr = [string UTF8String];
    uint8_t digest[CC_SHA1_DIGEST_LENGTH];
    CC_SHA1(cstr, (CC_LONG)strlen(cstr), digest);
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_SHA1_DIGEST_LENGTH * 2];
    for (int i = 0; i < CC_SHA1_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    return output;
}

+ (NSString*)hashUsingMD5:(NSString*)string {
    const char *cstr = [string UTF8String];
    uint8_t digest[CC_MD5_DIGEST_LENGTH];
    CC_MD5(cstr, (CC_LONG)strlen(cstr), digest);
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
    for (int i = 0; i < CC_MD5_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    return output;
}

#pragma clang diagnostic pop
#pragma clang diagnostic pop
#pragma clang diagnostic pop
@end

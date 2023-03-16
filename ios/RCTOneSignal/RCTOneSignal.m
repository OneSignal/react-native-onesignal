#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTUtils.h>
#else
#import "RCTConvert.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"
#endif

#import "RCTOneSignal.h"
#import "RCTOneSignalEventEmitter.h"

#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0

#define UIUserNotificationTypeAlert UIRemoteNotificationTypeAlert
#define UIUserNotificationTypeBadge UIRemoteNotificationTypeBadge
#define UIUserNotificationTypeSound UIRemoteNotificationTypeSound
#define UIUserNotificationTypeNone  UIRemoteNotificationTypeNone
#define UIUserNotificationType      UIRemoteNotificationType

#endif

@interface RCTOneSignal ()
@end

@implementation RCTOneSignal {
    BOOL didInitialize;
}

OSNotificationOpenedResult* coldStartOSNotificationOpenedResult;

+ (RCTOneSignal *) sharedInstance {
    static dispatch_once_t token = 0;
    static id _sharedInstance = nil;
    dispatch_once(&token, ^{
        _sharedInstance = [[RCTOneSignal alloc] init];
    });
    return _sharedInstance;
}

- (void)setLaunchOptions:(NSDictionary *)launchOptions {

    if (didInitialize)
        return;

    [OneSignal setLaunchOptions:launchOptions];
    didInitialize = true;
}

- (void)handleRemoteNotificationOpened:(NSString *)result {
    NSDictionary *json = [self jsonObjectWithString:result];

    if (json) {
        [self sendEvent:OSEventString(NotificationClicked) withBody:json];
    }
}

- (NSDictionary *)jsonObjectWithString:(NSString *)jsonString {
    NSError *jsonError;
    NSData *data = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:&jsonError];

    if (jsonError) {
        return nil;
    }

    return json;
}

- (void)sendEvent:(NSString *)eventName withBody:(NSDictionary *)body {
    [RCTOneSignalEventEmitter sendEventWithName:eventName withBody:body];
}

- (void)onOSPushSubscriptionChangedWithStateChanges:(OSPushSubscriptionStateChanges * _Nonnull)stateChanges {
    [self sendEvent:OSEventString(SubscriptionChanged) withBody:[stateChanges jsonRepresentation]];
}

- (void)onOSPermissionChanged:(OSPermissionState *)state {
    [self sendEvent:OSEventString(PermissionChanged) withBody:[state jsonRepresentation]];
}

- (void)onWillDisplayInAppMessage:(OSInAppMessage * _Nonnull)message {
    [self sendEvent:OSEventString(InAppMessageWillDisplay) withBody:[message jsonRepresentation]];
}

- (void)onDidDisplayInAppMessage:(OSInAppMessage * _Nonnull)message {
    [self sendEvent:OSEventString(InAppMessageDidDisplay) withBody:[message jsonRepresentation]];
}

- (void)onWillDismissInAppMessage:(OSInAppMessage * _Nonnull)message {
    [self sendEvent:OSEventString(InAppMessageWillDismiss) withBody:[message jsonRepresentation]];
}

- (void)onDidDismissInAppMessage:(OSInAppMessage * _Nonnull)message {
    [self sendEvent:OSEventString(InAppMessageDidDismiss) withBody:[message jsonRepresentation]];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end

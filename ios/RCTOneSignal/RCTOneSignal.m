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

- (void)initOneSignal {

    if (didInitialize)
        return;

    didInitialize = true;
    [OneSignal addSubscriptionObserver:self];
    [OneSignal addEmailSubscriptionObserver:self];
    [OneSignal initWithLaunchOptions:nil];
}

- (void)handleRemoteNotificationOpened:(NSString *)result {
    NSDictionary *json = [self jsonObjectWithString:result];

    if (json)
        [self sendEvent:OSEventString(NotificationOpened) withBody:json];
}

- (NSDictionary *)jsonObjectWithString:(NSString *)jsonString {
    NSError *jsonError;
    NSData *data = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:&jsonError];

    if (jsonError) {
        [OneSignal onesignal_Log:ONE_S_LL_ERROR message:[NSString stringWithFormat:@"Unable to serialize JSON string into an object: %@", jsonError]];
        return nil;
    }

    return json;
}

- (void)sendEvent:(NSString *)eventName withBody:(NSDictionary *)body {
    [RCTOneSignalEventEmitter sendEventWithName:eventName withBody:body];
}

- (void)onOSSubscriptionChanged:(OSSubscriptionStateChanges * _Nonnull)stateChanges {
    [self sendEvent:OSEventString(SubscriptionChanged) withBody:stateChanges.to.toDictionary];
}

- (void)onOSEmailSubscriptionChanged:(OSEmailSubscriptionStateChanges * _Nonnull)stateChanges {
    // Example of detecting subscribing to OneSignal
    if (!stateChanges.from.subscribed && stateChanges.to.subscribed) {
        //Subscribed for OneSignal push notifications!
    }

    [self sendEvent:OSEventString(EmailSubscriptionChanged) withBody:stateChanges.to.toDictionary];
}

- (void)didBeginObserving {
    // To continue supporting deprecated initialization methods (which create a new RCTOneSignal instance),
    // we will only access the didStartObserving property of the shared instance to avoid issues
    RCTOneSignal.sharedInstance.didStartObserving = true;

    dispatch_async(dispatch_get_main_queue(), ^{
        if (coldStartOSNotificationOpenedResult) {
            [self handleRemoteNotificationOpened:[coldStartOSNotificationOpenedResult stringify]];
            coldStartOSNotificationOpenedResult = nil;
        }
    });
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end

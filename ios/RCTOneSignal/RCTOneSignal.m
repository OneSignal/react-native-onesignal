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
    BOOL didStartObserving;
}

OSNotificationOpenedResult* coldStartOSNotificationOpenedResult;

- (void)didStartObserving {
    didStartObserving = true;
    
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

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId {
    return [self initWithLaunchOptions:launchOptions appId:appId settings:nil];
}

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId settings:(NSDictionary*)settings {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(didStartObserving) name:nil object:nil];
    [OneSignal addSubscriptionObserver:self];
    [OneSignal addEmailSubscriptionObserver:self];
    [OneSignal setValue:@"react" forKey:@"mSDKType"];
    [OneSignal initWithLaunchOptions:launchOptions
                               appId:appId
          handleNotificationReceived:^(OSNotification* notification) {
              [self handleRemoteNotificationReceived:[notification stringify]];
          }
          handleNotificationAction:^(OSNotificationOpenedResult *result) {
              if (!didStartObserving)
                  coldStartOSNotificationOpenedResult = result;
              else
                  [self handleRemoteNotificationOpened:[result stringify]];
              
          }
          settings:settings];

    return self;
}

-(void)onOSEmailSubscriptionChanged:(OSEmailSubscriptionStateChanges *)stateChanges {
    [self sendEvent:OSEventString(EmailSubscriptionChanged) withBody:stateChanges.to.toDictionary];
}

- (void)onOSSubscriptionChanged:(OSSubscriptionStateChanges*)stateChanges {
    
    // Example of detecting subscribing to OneSignal
    if (!stateChanges.from.subscribed && stateChanges.to.subscribed) {
        //Subscribed for OneSignal push notifications!
    }
    
    [self sendEvent:OSEventString(IdsAvailable) withBody:stateChanges.to.toDictionary];
}

- (void)handleRemoteNotificationReceived:(NSString *)notification {
    NSDictionary *json = [self jsonObjectWithString:notification];
    
    if (json)
        [self sendEvent:OSEventString(NotificationReceived) withBody:json];
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

@end

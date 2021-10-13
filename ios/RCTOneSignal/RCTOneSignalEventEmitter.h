#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTUtils.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#import "RCTEventEmitter.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"
#endif

typedef NS_ENUM(NSInteger, OSNotificationEventTypes) {
    PermissionChanged,
    SubscriptionChanged,
    NotificationWillShowInForeground,
    NotificationOpened,
    InAppMessageClicked,
    EmailSubscriptionChanged,
    SMSSubscriptionChanged,
    InAppMessageWillDisplay,
    InAppMessageDidDisplay,
    InAppMessageWillDismiss,
    InAppMessageDidDismiss,
};

#define OSNotificationEventTypesArray @[@"OneSignal-permissionChanged",@"OneSignal-subscriptionChanged",@"OneSignal-notificationWillShowInForeground",@"OneSignal-remoteNotificationOpened",@"OneSignal-inAppMessageClicked",@"OneSignal-emailSubscriptionChanged", @"OneSignal-smsSubscriptionChanged", @"OneSignal-inAppMessageWillDisplay", @"OneSignal-inAppMessageDidDisplay", @"OneSignal-inAppMessageWillDismiss", @"OneSignal-inAppMessageDidDismiss"]

#define OSEventString(enum) [OSNotificationEventTypesArray objectAtIndex:enum]

@interface RCTOneSignalEventEmitter : RCTEventEmitter <RCTBridgeModule>

+ (void)sendEventWithName:(NSString *)name withBody:(NSDictionary *)body;
+ (BOOL)hasSetBridge;

@end

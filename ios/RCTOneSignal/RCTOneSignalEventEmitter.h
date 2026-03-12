#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUtils.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"
#import "RCTEventEmitter.h"
#import "RCTUtils.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import <RNOneSignalSpec/RNOneSignalSpec.h>
#endif

typedef NS_ENUM(NSInteger, OSNotificationEventTypes) {
  PermissionChanged,
  SubscriptionChanged,
  UserStateChanged,
  NotificationWillDisplayInForeground,
  NotificationClicked,
  InAppMessageClicked,
  InAppMessageWillDisplay,
  InAppMessageDidDisplay,
  InAppMessageWillDismiss,
  InAppMessageDidDismiss,
};

#define OSNotificationEventTypesArray                                          \
  @[                                                                           \
    @"OneSignal-permissionChanged", @"OneSignal-subscriptionChanged",          \
    @"OneSignal-userStateChanged",                                             \
    @"OneSignal-notificationWillDisplayInForeground",                          \
    @"OneSignal-notificationClicked", @"OneSignal-inAppMessageClicked",        \
    @"OneSignal-inAppMessageWillDisplay", @"OneSignal-inAppMessageDidDisplay", \
    @"OneSignal-inAppMessageWillDismiss", @"OneSignal-inAppMessageDidDismiss"  \
  ]

#define OSEventString(enum) [OSNotificationEventTypesArray objectAtIndex:enum]

#ifdef RCT_NEW_ARCH_ENABLED
@interface RCTOneSignalEventEmitter : RCTEventEmitter <NativeOneSignalSpec>
#else
@interface RCTOneSignalEventEmitter : RCTEventEmitter <RCTBridgeModule>
#endif

+ (void)sendEventWithName:(NSString *)name withBody:(NSDictionary *)body;
+ (BOOL)hasSetBridge;

@end

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#endif

#import <RNOneSignalSpec/RNOneSignalSpec.h>

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

@protocol OSNotificationLifecycleListener;

@interface RCTOneSignalEventEmitter
    : NativeOneSignalSpecBase <NativeOneSignalSpec,
                               OSNotificationLifecycleListener>

+ (void)sendEventWithName:(NSString *)name withBody:(NSDictionary *)body;

@end

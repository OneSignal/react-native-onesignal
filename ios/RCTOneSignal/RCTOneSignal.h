
#if __has_include(<OneSignalFramework/OneSignalFramework.h>)
#import <OneSignalFramework/OneSignalFramework.h>
#import <OneSignalUser/OneSignalUser-Swift.h>
#else
#import "../OneSignalFramework.h"
#endif

@interface RCTOneSignal
    : NSObject <OSPushSubscriptionObserver, OSNotificationPermissionObserver,
                OSInAppMessageLifecycleListener, OSInAppMessageClickListener,
                OSNotificationClickListener, OSUserStateObserver>
+ (RCTOneSignal *)sharedInstance;

@end

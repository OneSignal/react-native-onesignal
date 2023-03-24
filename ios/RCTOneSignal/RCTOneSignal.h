
#if __has_include(<OneSignalFramework/OneSignalFramework.h>)
#import <OneSignalFramework/OneSignalFramework.h>
#else
#import "../OneSignalFramework.h"
#endif

@interface RCTOneSignal : NSObject <OSPushSubscriptionObserver, OSPermissionObserver, OSInAppMessageLifecycleHandler>

+ (RCTOneSignal *) sharedInstance;

@end

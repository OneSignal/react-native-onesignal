
#if __has_include(<OneSignalFramework/OneSignalFramework.h>)
#import <OneSignalFramework/OneSignalFramework.h>
#else
#import "../OneSignalFramework.h"
#endif

#define INIT_DEPRECATION_NOTICE "Objective-C Initialization of the OneSignal SDK has been deprecated. Use JavaScript init instead."

@interface RCTOneSignal : NSObject <OSPushSubscriptionObserver, OSPermissionObserver, OSInAppMessageLifecycleHandler>

+ (RCTOneSignal *) sharedInstance;

@property (nonatomic) BOOL didStartObserving;

- (void)initialize:(nonnull NSString*)newAppId withLaunchOptions:(nullable NSDictionary*)launchOptions;
- (void)setLaunchOptions:(NSDictionary*)launchOptions;

@end

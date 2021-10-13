
#if __has_include(<OneSignal/OneSignal.h>)
#import <OneSignal/OneSignal.h>
#else
#import "../OneSignal.h"
#endif

#define INIT_DEPRECATION_NOTICE "Objective-C Initialization of the OneSignal SDK has been deprecated. Use JavaScript init instead."

@interface RCTOneSignal : NSObject <OSSubscriptionObserver, OSEmailSubscriptionObserver, OSPermissionObserver, OSSMSSubscriptionObserver, OSInAppMessageLifecycleHandler>

+ (RCTOneSignal *) sharedInstance;

@property (nonatomic) BOOL didStartObserving;

- (void)initOneSignal:(NSDictionary *)launchOptions;

@end

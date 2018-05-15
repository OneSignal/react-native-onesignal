
#if __has_include(<OneSignal/OneSignal.h>)
#import <OneSignal/OneSignal.h>
#else
#import "../OneSignal.h"
#endif

#define INIT_DEPRECATION_NOTICE "Objective-C Initialization of the OneSignal SDK has been deprecated. Use JavaScript init instead."

@interface RCTOneSignal : NSObject <OSSubscriptionObserver, OSEmailSubscriptionObserver>

+ (RCTOneSignal *) sharedInstance;

@property (nonatomic) BOOL didStartObserving;

- (void)configureWithAppId:(NSString *)appId;
- (void)configureWithAppId:(NSString *)appId settings:(NSDictionary*)settings;

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId settings:(NSDictionary*)settings __deprecated_msg(INIT_DEPRECATION_NOTICE);
- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId __deprecated_msg(INIT_DEPRECATION_NOTICE);

@end

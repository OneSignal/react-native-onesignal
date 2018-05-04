
#if __has_include(<OneSignal/OneSignal.h>)
#import <OneSignal/OneSignal.h>
#else
#import "OneSignal.h"
#endif

@interface RCTOneSignal : NSObject <OSSubscriptionObserver, OSEmailSubscriptionObserver>

+ (RCTOneSignal *) sharedInstance;

- (void)configureWithAppId:(NSString *)appId;
- (void)configureWithAppId:(NSString *)appId settings:(NSDictionary*)settings;

@end

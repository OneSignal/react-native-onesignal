#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#endif

#if __has_include(<OneSignal/OneSignal.h>)
#import <OneSignal/OneSignal.h>
#else
#import "OneSignal.h"
#endif

@interface RCTOneSignal : NSObject <RCTBridgeModule, OSSubscriptionObserver>

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId;
- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId settings:(NSDictionary*)settings;
+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary;
@end

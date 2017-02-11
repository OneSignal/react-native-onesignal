#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#endif

#import "OneSignal.h"

@interface RCTOneSignal : NSObject <RCTBridgeModule>

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId;
- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId settings:(NSDictionary*)settings;
+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary;
@end

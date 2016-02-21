#import "RCTBridgeModule.h"
#import "RCTRootView.h"
#import <OneSignal/OneSignal.h>

@interface RCTOneSignal : NSObject <RCTBridgeModule>

- (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString *)appId;
+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary;

@end

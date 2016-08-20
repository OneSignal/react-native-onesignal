#import "RCTBridgeModule.h"
#import "RCTRootView.h"
#import "RCTEventEmitter.h"
#import <OneSignal/OneSignal.h>

@interface RCTOneSignal : RCTEventEmitter <RCTBridgeModule>

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId;
- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId settings:(NSDictionary*)settings;
+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary;

@end

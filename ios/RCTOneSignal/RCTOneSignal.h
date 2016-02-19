#import "RCTBridgeModule.h"
#import "RCTRootView.h"
#import <OneSignal/OneSignal.h>

@interface RCTOneSignal : NSObject <RCTBridgeModule>

@property (nonatomic, strong) OneSignal *oneSignal;
- (id)initWithLaunchOptions:(NSDictionary*)launchOptions appId:(NSString *)appId;

+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary;
@end

#import "RCTOneSignal.h"

#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

NSString *const RCTRemoteNotificationReceived = @"RemoteNotificationReceived";

@interface RCTOneSignal()

@end

@implementation RCTOneSignal

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(OneSignal)

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)setBridge:(RCTBridge *)receivedBridge {
    _bridge = receivedBridge;
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRemoteNotificationReceived:)
                                                 name:RCTRemoteNotificationReceived
                                               object:nil];
}

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId  {
    // Eanble logging to help debug issues. visualLevel will show alert dialog boxes.
    [OneSignal setLogLevel:ONE_S_LL_NONE visualLevel:ONE_S_LL_NONE];
    
    self.oneSignal = [[OneSignal alloc]
                 initWithLaunchOptions:launchOptions
                 appId:appId
                 handleNotification:^(NSString* message, NSDictionary* additionalData, BOOL isActive) {
                     NSDictionary *dictionary = @{
                        @"message"     : message,
                        @"additionalData" : additionalData,
                        @"isActive" : [NSNumber numberWithBool:isActive]
                     };
                     [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                                         object:self userInfo:dictionary];
                 }];
    
    [self.oneSignal enableInAppAlertNotification:YES];
    return self;
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary {
    [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                        object:self userInfo:dictionary];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification {
    [_bridge.eventDispatcher sendDeviceEventWithName:@"remoteNotificationOpened" body:notification.userInfo];
}

@end

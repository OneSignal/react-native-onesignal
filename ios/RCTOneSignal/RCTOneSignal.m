#import "RCTOneSignal.h"

#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

NSString *const RCTRemoteNotificationReceived = @"RemoteNotificationReceived";

@interface RCTOneSignal()

@end

@implementation RCTOneSignal

static OneSignal *oneSignal;
@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(RNOneSignal)

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
    
    oneSignal = [[OneSignal alloc]
                      initWithLaunchOptions:launchOptions
                      appId:appId
                 handleNotification:^(NSString* message, NSDictionary* additionalData, BOOL isActive) {
                          NSDictionary *dictionary;
                          if (additionalData) {
                              dictionary = @{
                                  @"message"     : message,
                                  @"additionalData" : additionalData,
                                  @"isActive" : [NSNumber numberWithBool:isActive]
                                  };
                          } else {
                              dictionary = @{
                                             @"message"     : message,
                                             @"additionalData" : [[NSDictionary alloc] init],
                                             @"isActive" : [NSNumber numberWithBool:isActive]
                                             };
                          }
                          [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                                              object:self userInfo:dictionary];
                      }];
    
    [oneSignal enableInAppAlertNotification:NO];
    return self;
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary {
    [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                        object:self userInfo:dictionary];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification {
    [_bridge.eventDispatcher sendDeviceEventWithName:@"remoteNotificationOpened" body:notification.userInfo];
}

RCT_EXPORT_METHOD(sendTag:(NSString *)key value:(NSString*)value) {
    [oneSignal sendTag:key value:value];
}

RCT_EXPORT_METHOD(idsAvailable:(RCTResponseSenderBlock)callback) {
    [oneSignal IdsAvailable:^(NSString* userId, NSString* pushToken) {
        NSLog(@"UserId:%@", userId);
        if (pushToken != nil) {
            NSLog(@"pushToken:%@", pushToken);
            NSDictionary *value = @{
                                    @"pushToken": pushToken,
                                    @"playerId" : userId
                                    };
            callback(@[value]);
        } else {
            NSLog(@"Cannot Get Push Token");
        }
    }];
}

RCT_EXPORT_METHOD(sendTags:(NSDictionary *)properties) {
    [oneSignal sendTags:properties onSuccess:^(NSDictionary *sucess) {
        NSLog(@"Send Tags Success");
    } onFailure:^(NSError *error) {
        NSLog(@"Send Tags Failure");
    }];}

RCT_EXPORT_METHOD(getTags:(RCTResponseSenderBlock)callback) {
    [oneSignal getTags:^(NSDictionary *tags) {
        NSLog(@"Get Tags Success");
        callback(@[tags]);
    } onFailure:^(NSError *error) {
        NSLog(@"Get Tags Failure");
        callback(@[error]);
    }];
}

RCT_EXPORT_METHOD(deleteTag:(NSString *)key) {
    [oneSignal deleteTag:key];
}

@end
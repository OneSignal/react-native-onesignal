#import "RCTOneSignal.h"

#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

NSString *const OSRemoteNotificationReceived = @"RemoteNotificationReceived";

@interface RCTOneSignal()

@end

@implementation RCTOneSignal

static OneSignal *oneSignal;
@synthesize bridge = _bridge;

NSDictionary* launchDict;

RCT_EXPORT_MODULE(RNOneSignal)

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)setBridge:(RCTBridge *)receivedBridge {
    _bridge = receivedBridge;

    if (launchDict) {
        NSLog(@"launchDict:%@", launchDict);
        [_bridge.eventDispatcher sendDeviceEventWithName:@"remoteNotificationOpened" body:launchDict];
    }
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleRemoteNotificationReceived:)
                                                 name:OSRemoteNotificationReceived
                                               object:nil];
}

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId{
    
    return [self initWithLaunchOptions:launchOptions appId:appId autoRegister:YES];
}

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId autoRegister:(BOOL)autoRegister {
    oneSignal = [[OneSignal alloc]
                 initWithLaunchOptions:launchOptions
                 appId:appId
                 handleNotification:^(NSString* message, NSDictionary* additionalData, BOOL isActive) {
                     if (additionalData) {
                         launchDict = @{
                                        @"message"     : message,
                                        @"additionalData" : additionalData,
                                        @"isActive" : [NSNumber numberWithBool:isActive]
                                        };
                     } else {
                         launchDict = @{
                                        @"message"     : message,
                                        @"additionalData" : [[NSDictionary alloc] init],
                                        @"isActive" : [NSNumber numberWithBool:isActive]
                                        };
                     }
                     [[NSNotificationCenter defaultCenter] postNotificationName:OSRemoteNotificationReceived
                                                                         object:self userInfo:launchDict];
                 }
                 autoRegister:autoRegister];
    
    return self;
}

// This isn't required, the iOS native SDK already hooks into this event.
+ (void)didReceiveRemoteNotification:(NSDictionary *)dictionary {
    // Keeping empty method around so developers do not get compile errors when updating versions.
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification {
    [_bridge.eventDispatcher sendDeviceEventWithName:@"remoteNotificationOpened" body:notification.userInfo];
}

RCT_EXPORT_METHOD(registerForPushNotifications){
    
    [oneSignal registerForPushNotifications];
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
            callback(@[@{}]);
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

RCT_EXPORT_METHOD(setSubscription:(BOOL)enable) {
    [oneSignal setSubscription:enable];
}

@end
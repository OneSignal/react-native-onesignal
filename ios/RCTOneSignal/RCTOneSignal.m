#import "RCTOneSignal.h"
#import "RCTConvert.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"

#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0

#define UIUserNotificationTypeAlert UIRemoteNotificationTypeAlert
#define UIUserNotificationTypeBadge UIRemoteNotificationTypeBadge
#define UIUserNotificationTypeSound UIRemoteNotificationTypeSound
#define UIUserNotificationTypeNone  UIRemoteNotificationTypeNone
#define UIUserNotificationType      UIRemoteNotificationType

#endif

NSString *const OSRemoteNotificationReceived = @"RemoteNotificationReceived";
NSString *const OSRemoteNotificationsRegistered = @"RemoteNotificationsRegistered";

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
    BOOL firstBridge = (_bridge == nil);
    _bridge = receivedBridge;

    if (launchDict) {
        NSLog(@"launchDict:%@", launchDict);
        [_bridge.eventDispatcher sendDeviceEventWithName:@"remoteNotificationOpened" body:launchDict];
        launchDict = nil;
    }
    
    if (firstBridge) {
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                selector:@selector(handleRemoteNotificationReceived:)
                                                    name:OSRemoteNotificationReceived
                                                    object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                selector:@selector(handleRemoteNotificationsRegistered:)
                                                    name:OSRemoteNotificationsRegistered
                                                    object:nil];
    }
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

- (void)handleRemoteNotificationsRegistered:(NSNotification *)notification {
    [_bridge.eventDispatcher sendDeviceEventWithName:@"remoteNotificationsRegistered" body:notification.userInfo];
}

RCT_EXPORT_METHOD(requestPermissions:(NSDictionary *)permissions) {
    if (RCTRunningInAppExtension()) {
        return;
    }

    UIUserNotificationType types = UIUserNotificationTypeNone;
    if (permissions) {
        if ([RCTConvert BOOL:permissions[@"alert"]]) {
            types |= UIUserNotificationTypeAlert;
        }
        if ([RCTConvert BOOL:permissions[@"badge"]]) {
            types |= UIUserNotificationTypeBadge;
        }
        if ([RCTConvert BOOL:permissions[@"sound"]]) {
            types |= UIUserNotificationTypeSound;
        }
    } else {
        types = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound;
    }

    UIApplication *app = RCTSharedApplication();
    if ([app respondsToSelector:@selector(registerUserNotificationSettings:)]) {
        UIUserNotificationSettings *notificationSettings =
        [UIUserNotificationSettings settingsForTypes:(NSUInteger)types categories:nil];
        [app registerUserNotificationSettings:notificationSettings];
        [app registerForRemoteNotifications];
    } else {
        [app registerForRemoteNotificationTypes:(NSUInteger)types];
    }
}

RCT_EXPORT_METHOD(registerForPushNotifications) {
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
                                    @"userId" : userId
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

RCT_EXPORT_METHOD(enableInAppAlertNotification:(BOOL)enable) {
    [oneSignal enableInAppAlertNotification:enable];
}

@end

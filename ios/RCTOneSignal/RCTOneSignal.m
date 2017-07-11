#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTUtils.h>
#else
#import "RCTConvert.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"
#endif

#import "RCTOneSignal.h"

#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0

#define UIUserNotificationTypeAlert UIRemoteNotificationTypeAlert
#define UIUserNotificationTypeBadge UIRemoteNotificationTypeBadge
#define UIUserNotificationTypeSound UIRemoteNotificationTypeSound
#define UIUserNotificationTypeNone  UIRemoteNotificationTypeNone
#define UIUserNotificationType      UIRemoteNotificationType

#endif

@interface RCTOneSignal ()
@end

@implementation RCTOneSignal

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(RCTOneSignal)

static RCTBridge *curRCTBridge;

OSNotificationOpenedResult* coldStartOSNotificationOpenedResult;

- (void)setBridge:(RCTBridge *)receivedBridge {
    _bridge = receivedBridge;
    curRCTBridge = receivedBridge;
    
    if (coldStartOSNotificationOpenedResult) {
        [self handleRemoteNotificationOpened:[coldStartOSNotificationOpenedResult stringify]];
        coldStartOSNotificationOpenedResult = nil;
    }
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId {
    return [self initWithLaunchOptions:launchOptions appId:appId settings:nil];
}

- (id)initWithLaunchOptions:(NSDictionary *)launchOptions appId:(NSString *)appId settings:(NSDictionary*)settings {
    [OneSignal addSubscriptionObserver:self];
    [OneSignal setValue:@"react" forKey:@"mSDKType"];
    [OneSignal initWithLaunchOptions:launchOptions
                               appId:appId
          handleNotificationReceived:^(OSNotification* notification) {
              [self handleRemoteNotificationReceived:[notification stringify]];
          }
          handleNotificationAction:^(OSNotificationOpenedResult *result) {
              if (!curRCTBridge)
                  coldStartOSNotificationOpenedResult = result;
              else
                  [self handleRemoteNotificationOpened:[result stringify]];
          }
          settings:settings];

    return self;
}

- (void)onOSSubscriptionChanged:(OSSubscriptionStateChanges*)stateChanges {
    
    // Example of detecting subscribing to OneSignal
    if (!stateChanges.from.subscribed && stateChanges.to.subscribed) {
        NSLog(@"Subscribed for OneSignal push notifications!");
    }
    
    // prints out all properties
    NSLog(@"SubscriptionStateChanges:\n%@", stateChanges.to);
    [self.bridge.eventDispatcher sendAppEventWithName:@"OneSignal-idsAvailable" body:stateChanges.to];
}

- (void)handleRemoteNotificationReceived:(NSString *)notification {
    
    NSError *jsonError;
    NSData *objectData = [notification dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&jsonError];

    
    
    [curRCTBridge.eventDispatcher sendAppEventWithName:@"OneSignal-remoteNotificationReceived" body:json];
}

- (void)handleRemoteNotificationOpened:(NSString *)result {
    
    NSError *jsonError;
    NSData *objectData = [result dataUsingEncoding:NSUTF8StringEncoding];
    NSDictionary *json = [NSJSONSerialization JSONObjectWithData:objectData
                                                         options:NSJSONReadingMutableContainers
                                                           error:&jsonError];
    
    [curRCTBridge.eventDispatcher sendAppEventWithName:@"OneSignal-remoteNotificationOpened" body:json];
}

- (void)handleRemoteNotificationsRegistered:(NSNotification *)notification {
    [self.bridge.eventDispatcher sendAppEventWithName:@"OneSignal-remoteNotificationsRegistered" body:notification.userInfo];
}

RCT_EXPORT_METHOD(checkPermissions:(RCTResponseSenderBlock)callback)
{
    if (RCTRunningInAppExtension()) {
        callback(@[@{@"alert": @NO, @"badge": @NO, @"sound": @NO}]);
        return;
    }
    
    NSUInteger types = 0;
    if ([UIApplication instancesRespondToSelector:@selector(currentUserNotificationSettings)]) {
        types = [RCTSharedApplication() currentUserNotificationSettings].types;
    } else {
        
#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0
        types = [RCTSharedApplication() enabledRemoteNotificationTypes];
#endif
        
    }
    
    callback(@[@{
                   @"alert": @((types & UIUserNotificationTypeAlert) > 0),
                   @"badge": @((types & UIUserNotificationTypeBadge) > 0),
                   @"sound": @((types & UIUserNotificationTypeSound) > 0),
                   }]);
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
    [OneSignal registerForPushNotifications];
}

RCT_EXPORT_METHOD(promptForPushNotificationsWithUserResponse:(RCTResponseSenderBlock)callback) {
    [OneSignal promptForPushNotificationsWithUserResponse:^(BOOL accepted) {
        NSLog(@"Prompt For Push Notifications Success");
        callback(@[@(accepted)]);
    }];
}

RCT_EXPORT_METHOD(sendTag:(NSString *)key value:(NSString*)value) {
    [OneSignal sendTag:key value:value];
}

RCT_EXPORT_METHOD(configure) {
    [OneSignal IdsAvailable:^(NSString* userId, NSString* pushToken) {

        NSDictionary *params = @{
          @"pushToken": pushToken ?: [NSNull null],
          @"userId" : userId ?: [NSNull null]
        };

        [self.bridge.eventDispatcher sendAppEventWithName:@"OneSignal-idsAvailable" body:params];
    }];
}

RCT_EXPORT_METHOD(sendTags:(NSDictionary *)properties) {
    [OneSignal sendTags:properties onSuccess:^(NSDictionary *sucess) {
        NSLog(@"Send Tags Success");
    } onFailure:^(NSError *error) {
        NSLog(@"Send Tags Failure");
    }];}

RCT_EXPORT_METHOD(getTags:(RCTResponseSenderBlock)callback) {
    [OneSignal getTags:^(NSDictionary *tags) {
        NSLog(@"Get Tags Success");
        callback(@[tags]);
    } onFailure:^(NSError *error) {
        NSLog(@"Get Tags Failure");
        callback(@[error]);
    }];
}

RCT_EXPORT_METHOD(deleteTag:(NSString *)key) {
    [OneSignal deleteTag:key];
}

RCT_EXPORT_METHOD(setSubscription:(BOOL)enable) {
    [OneSignal setSubscription:enable];
}

RCT_EXPORT_METHOD(promptLocation) {
    [OneSignal promptLocation];
}

RCT_EXPORT_METHOD(postNotification:(NSDictionary *)contents data:(NSDictionary *)data player_id:(NSString*)player_id other_parameters:(NSDictionary *)other_parameters) {
    NSDictionary * additionalData = @{@"p2p_notification": data};

    NSMutableDictionary * extendedData = [additionalData mutableCopy];
    BOOL isHidden = [[other_parameters objectForKey:@"hidden"] boolValue];
    if (isHidden) {
        [extendedData setObject:[NSNumber numberWithBool:YES] forKey:@"hidden"];
    }

    NSDictionary *notification = @{
        @"contents" : contents,
        @"data" : extendedData,
        @"include_player_ids": @[player_id]
    };
    NSMutableDictionary * extendedNotification = [notification mutableCopy];
    [extendedNotification addEntriesFromDictionary: other_parameters];

    [OneSignal postNotification:extendedNotification];
}

RCT_EXPORT_METHOD(syncHashedEmail:(NSString*)email) {
    [OneSignal syncHashedEmail:email];
}

RCT_EXPORT_METHOD(setLogLevel:(ONE_S_LOG_LEVEL)logLevel visualLogLevel:(ONE_S_LOG_LEVEL)visualLogLevel) {
    [OneSignal setLogLevel:logLevel visualLevel:visualLogLevel];
}

@end

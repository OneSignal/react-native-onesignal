#import "RCTOneSignalEventEmitter.h"
#import <OneSignalFramework/OneSignalFramework.h>
#import "RCTOneSignal.h"
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"


@implementation RCTOneSignalEventEmitter {
    BOOL _hasListeners;
    BOOL _hasSetSubscriptionObserver;
    BOOL _hasSetPermissionObserver;
    BOOL _hasSetEmailSubscriptionObserver;
    BOOL _hasSetSMSSubscriptionObserver;
    BOOL _hasSetInAppMessageLifecycleHandler;
    NSMutableDictionary* _notificationCompletionCache;
    NSMutableDictionary* _receivedNotificationCache;
}

static BOOL _didStartObserving = false;

+ (BOOL)hasSetBridge {
    return _didStartObserving;
}

+(BOOL)requiresMainQueueSetup {
    return YES;
}

/*
     This class acts as the module & event emitter
     It is initialized automatically by React-Native
     This subclass handles communication between the SDK and JavaScript
*/

RCT_EXPORT_MODULE(RCTOneSignal)

#pragma mark RCTEventEmitter Subclass Methods

- (instancetype)init {
    if (self = [super init]) {
        _notificationCompletionCache = [NSMutableDictionary new];
        _receivedNotificationCache = [NSMutableDictionary new];

        for (NSString *eventName in [self supportedEvents])
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(emitEvent:) name:eventName object:nil];
    }

    return self;
}

- (void)startObserving {
    _hasListeners = true;

    [[NSNotificationCenter defaultCenter] postNotificationName:@"didSetBridge" object:nil];

    _didStartObserving = true;
}

- (void)stopObserving {
    _hasListeners = false;
}

- (NSArray<NSString *> *)supportedEvents {
    NSMutableArray *events = [NSMutableArray new];

    for (int i = 0; i < OSNotificationEventTypesArray.count; i++) {
        [events addObject:OSEventString(i)];
    }

    return events;
}

- (NSArray<NSString *> *)processNSError:(NSError *)error {
    if (error.userInfo[@"error"]) {
        return @[error.userInfo[@"error"]];
    } else if (error.userInfo[@"returned"]) {
        return @[error.userInfo[@"returned"]];
    }
    
    return @[error.localizedDescription];
}


#pragma mark Send Event Methods

- (void)emitEvent:(NSNotification *)notification {
    if (!_hasListeners) return;

    [self sendEventWithName:notification.name body:notification.userInfo];
}

+ (void)sendEventWithName:(NSString *)name withBody:(NSDictionary *)body {
    [[NSNotificationCenter defaultCenter] postNotificationName:name object:nil userInfo:body];
}


#pragma mark Exported Methods

// OneSignal root namespace methods
RCT_EXPORT_METHOD(initialize:(NSString* _Nonnull)appId) {
    [OneSignal initialize:appId withLaunchOptions:NULL];
}

RCT_EXPORT_METHOD(setLaunchOptions:(NSDictionary *)launchOptions) {
    [OneSignal setLaunchOptions:launchOptions];
}

RCT_EXPORT_METHOD(setLaunchURLsInApp:(BOOL)isEnabled) {
    [OneSignal setLaunchURLsInApp:isEnabled];
}

RCT_EXPORT_METHOD(login:(NSString *)externalId) {
    [OneSignal login:externalId];
}

RCT_EXPORT_METHOD(logout) {
    [OneSignal logout];
}

RCT_EXPORT_METHOD(enterLiveActivity:(NSString *)activityId 
                  withToken:(NSString *)token
                  withResponse:(RCTResponseSenderBlock)callback) {
    [OneSignal enterLiveActivity:activityId withToken:token withSuccess:^(NSDictionary *result) {
        callback(@[result]);
    } withFailure:^(NSError *error) {
        callback([self processNSError:error]);
    }];
}

RCT_EXPORT_METHOD(exitLiveActivity:(NSString *)activityId
                  withResponse:(RCTResponseSenderBlock)callback) {
    [OneSignal exitLiveActivity:activityId withSuccess:^(NSDictionary *result) {
        callback(@[result]);
    } withFailure:^(NSError *error) {
        callback([self processNSError:error]);
    }];
}

RCT_REMAP_METHOD(getPrivacyConsent, 
                 getPrivacyConsentResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@(OneSignal.getPrivacyConsent));
}

RCT_EXPORT_METHOD(setPrivacyConsent:(BOOL)granted) {
    dispatch_async(dispatch_get_main_queue(), ^{
        [OneSignal setPrivacyConsent:granted];
    });
}

RCT_REMAP_METHOD(getRequiresPrivacyConsent, 
                 getRequiresPrivacyConsentResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([OneSignal requiresPrivacyConsent]));
}

RCT_EXPORT_METHOD(setRequiresPrivacyConsent:(BOOL)required) {
    [OneSignal setRequiresPrivacyConsent:required];
}

// OneSignal.Debug namespace methods
RCT_EXPORT_METHOD(setLogLevel:(int)logLevel) {
    [OneSignal.Debug setLogLevel:logLevel];
}

RCT_EXPORT_METHOD(setAlertLevel:(int)logLevel) {
    [OneSignal.Debug setAlertLevel:logLevel];
}

// OneSignal.InAppMessages namespace methods
RCT_REMAP_METHOD(getPaused, 
                 getPausedResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([OneSignal.InAppMessages paused]));
}

RCT_EXPORT_METHOD(paused:(BOOL)pause) {
    [OneSignal.InAppMessages paused:pause];
}

RCT_EXPORT_METHOD(addTrigger:(NSString *)key withValue:(NSString *)value) {
    [OneSignal.InAppMessages addTrigger:key withValue:value];
}

RCT_EXPORT_METHOD(addTriggers:(NSDictionary *)triggers) {
    [OneSignal.InAppMessages addTriggers:triggers];
}

RCT_EXPORT_METHOD(removeTrigger:(NSString *)key) {
    [OneSignal.InAppMessages removeTrigger:key];
}

RCT_EXPORT_METHOD(removeTriggers:(NSArray *)keys) {
    [OneSignal.InAppMessages removeTriggers:keys];
}

RCT_EXPORT_METHOD(clearTriggers) {
    [OneSignal.InAppMessages clearTriggers];
}

RCT_EXPORT_METHOD(setClickHandler) {
    [OneSignal.InAppMessages setClickHandler:^(OSInAppMessageAction *action) {
        [RCTOneSignalEventEmitter sendEventWithName:@"OneSignal-inAppMessageClicked" withBody:[action jsonRepresentation]];
    }];
}

RCT_EXPORT_METHOD(setLifecycleHandler) {
    if (!_hasSetInAppMessageLifecycleHandler) {
       [OneSignal.InAppMessages setLifecycleHandler:[RCTOneSignal sharedInstance]];
        _hasSetInAppMessageLifecycleHandler = true;
    }
}

// OneSignal.Location namespace methods
RCT_REMAP_METHOD(isLocationShared,
                 isLocationSharedResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([OneSignal.Location isShared]));
}

RCT_EXPORT_METHOD(setLocationShared:(BOOL)shared) {
    [OneSignal.Location setShared:shared];
}

RCT_EXPORT_METHOD(requestLocationPermission) {
    [OneSignal.Location requestPermission];
}

// OneSignal.Notifications namespace methods
RCT_REMAP_METHOD(hasNotificationPermission, 
                 hasNotificationPermissionResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([OneSignal.Notifications permission]));
}

RCT_REMAP_METHOD(canRequestNotificationPermission, 
                 canRequestNotificationPermissionResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@([OneSignal.Notifications canRequestPermission]));
}

RCT_EXPORT_METHOD(requestNotificationPermission:fallbackToSettings :(RCTResponseSenderBlock)callback) {
    [OneSignal.Notifications requestPermission:^(BOOL accepted) {
        callback(@[@(accepted)]);
    } fallbackToSettings:fallbackToSettings];
}

RCT_EXPORT_METHOD(registerForProvisionalAuthorization:(RCTResponseSenderBlock)callback) {
    [OneSignal.Notifications registerForProvisionalAuthorization:^(BOOL accepted) {
        callback(@[@(accepted)]);
    }];
}

RCT_EXPORT_METHOD(addPermissionObserver) {
    if (!_hasSetPermissionObserver) {
        [OneSignal.Notifications addPermissionObserver:[RCTOneSignal sharedInstance]];
        _hasSetPermissionObserver = true;
    }
}

RCT_EXPORT_METHOD(removePermissionObserver) {
    if (_hasSetPermissionObserver) {
        [OneSignal.Notifications removePermissionObserver:[RCTOneSignal sharedInstance]];
        _hasSetPermissionObserver = false;
    }
}

RCT_EXPORT_METHOD(setNotificationOpenedHandler) {
    [OneSignal.Notifications setNotificationOpenedHandler:^(OSNotificationOpenedResult *result) {
        [RCTOneSignalEventEmitter sendEventWithName:@"OneSignal-remoteNotificationOpened" withBody:[result jsonRepresentation]];
    }];
}

RCT_EXPORT_METHOD(clearAllNotifications) {
    [OneSignal.Notifications clearAll];
}

RCT_EXPORT_METHOD(setNotificationWillShowInForegroundHandler) {
    __weak RCTOneSignalEventEmitter *weakSelf = self;
    [OneSignal.Notifications setNotificationWillShowInForegroundHandler:^(OSNotification *notif, OSNotificationDisplayResponse completion) {
        RCTOneSignalEventEmitter *strongSelf = weakSelf;
        if (!strongSelf) return;

        strongSelf->_receivedNotificationCache[notif.notificationId] = notif;
        strongSelf->_notificationCompletionCache[notif.notificationId] = completion;
        [RCTOneSignalEventEmitter sendEventWithName:@"OneSignal-notificationWillShowInForeground" withBody:[notif jsonRepresentation]];
    }];
}

// OneSignal.Session namespace methods
RCT_EXPORT_METHOD(addOutcome:(NSString *)name) {
    [OneSignal.Session addOutcome:name];
}

RCT_EXPORT_METHOD(addUniqueOutcome:(NSString *)name) {
    [OneSignal.Session addUniqueOutcome:name];
}

RCT_EXPORT_METHOD(addOutcomeWithValue:(NSString *)name :(NSNumber * _Nonnull)value) {
    [OneSignal.Session addOutcomeWithValue:name value:value];
}

// OneSignal.User namespace methods
RCT_EXPORT_METHOD(addPushObserver) {
    if (!_hasSetSubscriptionObserver) {
        [OneSignal.User.pushSubscription addObserver:[RCTOneSignal sharedInstance]];
        _hasSetSubscriptionObserver = true;
    }
}

RCT_EXPORT_METHOD(removePushObserver) {
    if (_hasSetSubscriptionObserver) {
        [OneSignal.User.pushSubscription removeObserver:[RCTOneSignal sharedInstance]];
        _hasSetSubscriptionObserver = false;
    }
}

RCT_EXPORT_METHOD(addEmail) {
    if (!_hasSetEmailSubscriptionObserver) {
        [OneSignal.User addEmail:[RCTOneSignal sharedInstance]];
        _hasSetEmailSubscriptionObserver = true;
    }
}

RCT_EXPORT_METHOD(removeEmail) {
    if (_hasSetEmailSubscriptionObserver) {
        [OneSignal.User removeEmail:[RCTOneSignal sharedInstance]];
        _hasSetEmailSubscriptionObserver = false;
    }
}

RCT_EXPORT_METHOD(setLanguage:(NSString *)language) {
    [OneSignal.User setLanguage:language];
}

RCT_EXPORT_METHOD(addEmail:(NSString *)email) {
    [OneSignal.User addEmail:email];
}

RCT_EXPORT_METHOD(removeEmail:(NSString *)email) {
    [OneSignal.User removeEmail:email];
}

RCT_EXPORT_METHOD(addSms:(NSString *)smsNumber) {
    [OneSignal.User addSms:smsNumber];
}

RCT_EXPORT_METHOD(removeSms:(NSString *)smsNumber) {
    [OneSignal.User removeSms:smsNumber]; 
}

RCT_EXPORT_METHOD(addTagWithKey:(NSString *)key value:(NSString*)value) {
    [OneSignal.User addTagWithKey:key value:value];
}

RCT_EXPORT_METHOD(addTags:(NSDictionary *)tags) {
    [OneSignal.User addTags:tags];
}

RCT_EXPORT_METHOD(removeTag:(NSString *)key) {
    [OneSignal.User removeTag:key];
}

RCT_EXPORT_METHOD(removeTags:(NSArray *)keys) {
    [OneSignal.User removeTags:keys];
}

RCT_EXPORT_METHOD(addAlias:(NSString *)label :(NSString *)id) {
    [OneSignal.User addAliasWithLabel:label id:id];
}

RCT_EXPORT_METHOD(removeAlias:(NSString *)label) {
    [OneSignal.User removeAlias:label];
}

RCT_EXPORT_METHOD(addAliases:(NSDictionary *)aliases) {
    [OneSignal.User addAliases:aliases];
}

RCT_EXPORT_METHOD(removeAliases:(NSArray *)labels) {
    [OneSignal.User removeAliases:labels];
}


// OneSignal.User.pushSubscription namespace methods
RCT_REMAP_METHOD(getOptedIn, 
                 getOptedInResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(@(OneSignal.User.pushSubscription.optedIn));
}

RCT_REMAP_METHOD(getPushSubscriptionId, 
                 getPushSubscriptionIdResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(OneSignal.User.pushSubscription.id);
}

RCT_REMAP_METHOD(getPushSubscriptionToken, 
                 getPushSubscriptionTokenResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
    resolve(OneSignal.User.pushSubscription.token);
}

RCT_EXPORT_METHOD(optIn) {
    [OneSignal.User.pushSubscription optIn];
}

RCT_EXPORT_METHOD(optOut) {
    [OneSignal.User.pushSubscription optOut];
}

RCT_EXPORT_METHOD(completeNotificationEvent:(NSString*)notificationId displayOption:(BOOL)shouldDisplay) {
    OSNotificationDisplayResponse completion = _notificationCompletionCache[notificationId];
    if (!completion) return;

    if (shouldDisplay) {
        OSNotification *notif = _receivedNotificationCache[notificationId];
        dispatch_async(dispatch_get_main_queue(), ^{
            completion(notif);
        });
    } else {
        completion(nil);
    }

    [_notificationCompletionCache removeObjectForKey:notificationId];
    [_receivedNotificationCache removeObjectForKey:notificationId];
}

RCT_EXPORT_METHOD(initInAppMessageClickHandlerParams) {
    // iOS Stub
}

@end
#import "RCTOneSignalEventEmitter.h"
#import "OneSignalLiveActivities/OneSignalLiveActivities-Swift.h"
#import "RCTOneSignal.h"
#import <OneSignalFramework/OneSignalFramework.h>
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

@implementation RCTOneSignalEventEmitter {
  BOOL _hasListeners;
  BOOL _hasSetSubscriptionObserver;
  BOOL _hasSetPermissionObserver;
  BOOL _hasSetUserStateObserver;
  BOOL _hasAddedNotificationClickListener;
  BOOL _hasAddedNotificationForegroundLifecycleListener;
  BOOL _hasAddedInAppMessageClickListener;
  BOOL _hasAddedInAppMessageLifecycleListener;
  NSMutableDictionary *_preventDefaultCache;
  NSMutableDictionary *_notificationWillDisplayCache;
}

static BOOL _didStartObserving = false;
// Static reference to track current instance for cleanup on reload
static RCTOneSignalEventEmitter *_currentInstance = nil;

+ (BOOL)hasSetBridge {
  return _didStartObserving;
}

+ (BOOL)requiresMainQueueSetup {
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
    _preventDefaultCache = [NSMutableDictionary new];
    _notificationWillDisplayCache = [NSMutableDictionary new];

    for (NSString *eventName in [self supportedEvents])
      [[NSNotificationCenter defaultCenter] addObserver:self
                                               selector:@selector(emitEvent:)
                                                   name:eventName
                                                 object:nil];

    // Clean up previous instance if it exists (handles reload scenario)
    if (_currentInstance != nil && _currentInstance != self) {
      [_currentInstance removeHandlers];
      [_currentInstance removeObservers];
    }
    _currentInstance = self;
  }

  return self;
}

- (void)startObserving {
  _hasListeners = true;

  [[NSNotificationCenter defaultCenter] postNotificationName:@"didSetBridge"
                                                      object:nil];

  _didStartObserving = true;
}

- (void)stopObserving {
  _hasListeners = false;
  [self removeHandlers];
  [self removeObservers];
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
    return @[ error.userInfo[@"error"] ];
  } else if (error.userInfo[@"returned"]) {
    return @[ error.userInfo[@"returned"] ];
  }

  return @[ error.localizedDescription ];
}

#pragma mark Send Event Methods

- (void)emitEvent:(NSNotification *)notification {
  if (!_hasListeners)
    return;

  [self sendEventWithName:notification.name body:notification.userInfo];
}

+ (void)sendEventWithName:(NSString *)name withBody:(NSDictionary *)body {
  [[NSNotificationCenter defaultCenter] postNotificationName:name
                                                      object:nil
                                                    userInfo:body];
}

#pragma mark Exported Methods

// OneSignal root namespace methods
RCT_EXPORT_METHOD(initialize : (NSString *_Nonnull)appId) {
  [OneSignal initialize:appId withLaunchOptions:NULL];
}

RCT_EXPORT_METHOD(login : (NSString *)externalId) {
  [OneSignal login:externalId];
}

RCT_EXPORT_METHOD(logout) { [OneSignal logout]; }

RCT_EXPORT_METHOD(enterLiveActivity : (NSString *)activityId withToken : (
    NSString *)token withResponse : (RCTResponseSenderBlock)callback) {
  [OneSignal.LiveActivities enter:activityId
      withToken:token
      withSuccess:^(NSDictionary *result) {
        callback(@[ result ]);
      }
      withFailure:^(NSError *error) {
        callback([self processNSError:error]);
      }];
}

RCT_EXPORT_METHOD(exitLiveActivity : (NSString *)activityId withResponse : (
    RCTResponseSenderBlock)callback) {
  [OneSignal.LiveActivities exit:activityId
      withSuccess:^(NSDictionary *result) {
        callback(@[ result ]);
      }
      withFailure:^(NSError *error) {
        callback([self processNSError:error]);
      }];
}

RCT_EXPORT_METHOD(setPushToStartToken : (NSString *)
                      activityType withToken : (NSString *)token) {
#if !TARGET_OS_MACCATALYST
  NSError *err = nil;
  if (@available(iOS 17.2, *)) {
    [OneSignalLiveActivitiesManagerImpl setPushToStartToken:activityType
                                                  withToken:token
                                                      error:&err];
    if (err) {
      [OneSignalLog
          onesignalLog:ONE_S_LL_ERROR
               message:[NSString
                           stringWithFormat:@"activityType must be the name of "
                                            @"your ActivityAttributes struct"]];
    }
  } else {
    [OneSignalLog
        onesignalLog:ONE_S_LL_ERROR
             message:[NSString
                         stringWithFormat:
                             @"cannot setPushToStartToken on iOS < 17.2"]];
  }
#endif
}

RCT_EXPORT_METHOD(removePushToStartToken : (NSString *)activityType) {
#if !TARGET_OS_MACCATALYST
  NSError *err = nil;
  if (@available(iOS 17.2, *)) {
    [OneSignalLiveActivitiesManagerImpl removePushToStartToken:activityType
                                                         error:&err];
    if (err) {
      [OneSignalLog
          onesignalLog:ONE_S_LL_ERROR
               message:[NSString
                           stringWithFormat:@"activityType must be the name of "
                                            @"your ActivityAttributes struct"]];
    }
  } else {
    [OneSignalLog
        onesignalLog:ONE_S_LL_ERROR
             message:[NSString
                         stringWithFormat:
                             @"cannot removePushToStartToken on iOS < 17.2"]];
  }
#endif
}

RCT_EXPORT_METHOD(setupDefaultLiveActivity : (NSDictionary *_Nullable)options) {
#if !TARGET_OS_MACCATALYST
  LiveActivitySetupOptions *laOptions = nil;
  if (options != nil) {
    laOptions = [LiveActivitySetupOptions alloc];
    [laOptions setEnablePushToStart:[options[@"enablePushToStart"] boolValue]];
    [laOptions
        setEnablePushToUpdate:[options[@"enablePushToUpdate"] boolValue]];
  }

  if (@available(iOS 16.1, *)) {
    [OneSignalLiveActivitiesManagerImpl setupDefaultWithOptions:laOptions];
  } else {
    [OneSignalLog
        onesignalLog:ONE_S_LL_ERROR
             message:[NSString stringWithFormat:
                                   @"cannot setupDefault on iOS < 16.1"]];
  }
#endif
}

RCT_EXPORT_METHOD(startDefaultLiveActivity : (
    NSString *)activityId withAttributes : (NSDictionary *_Nonnull)attributes
                      withContent : (NSDictionary *_Nonnull)content) {
#if !TARGET_OS_MACCATALYST
  if (@available(iOS 16.1, *)) {
    [OneSignalLiveActivitiesManagerImpl startDefault:activityId
                                          attributes:attributes
                                             content:content];
  } else {
    [OneSignalLog
        onesignalLog:ONE_S_LL_ERROR
             message:[NSString stringWithFormat:
                                   @"cannot startDefault on iOS < 16.1"]];
  }
#endif
}

RCT_EXPORT_METHOD(setPrivacyConsentGiven : (BOOL)granted) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [OneSignal setConsentGiven:granted];
  });
}

RCT_EXPORT_METHOD(setPrivacyConsentRequired : (BOOL)required) {
  [OneSignal setConsentRequired:required];
}

// OneSignal.Debug namespace methods
RCT_EXPORT_METHOD(setLogLevel : (int)logLevel) {
  [OneSignal.Debug setLogLevel:logLevel];
}

RCT_EXPORT_METHOD(setAlertLevel : (int)logLevel) {
  [OneSignal.Debug setAlertLevel:logLevel];
}

// OneSignal.InAppMessages namespace methods
RCT_REMAP_METHOD(getPaused,
                 getPausedResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@([OneSignal.InAppMessages paused]));
}

RCT_EXPORT_METHOD(paused : (BOOL)pause) {
  [OneSignal.InAppMessages paused:pause];
}

RCT_EXPORT_METHOD(addTrigger : (NSString *)key withValue : (NSString *)value) {
  [OneSignal.InAppMessages addTrigger:key withValue:value];
}

RCT_EXPORT_METHOD(addTriggers : (NSDictionary *)triggers) {
  [OneSignal.InAppMessages addTriggers:triggers];
}

RCT_EXPORT_METHOD(removeTrigger : (NSString *)key) {
  [OneSignal.InAppMessages removeTrigger:key];
}

RCT_EXPORT_METHOD(removeTriggers : (NSArray *)keys) {
  [OneSignal.InAppMessages removeTriggers:keys];
}

RCT_EXPORT_METHOD(clearTriggers) { [OneSignal.InAppMessages clearTriggers]; }

RCT_EXPORT_METHOD(addInAppMessageClickListener) {
  if (!_hasAddedInAppMessageClickListener) {
    [OneSignal.InAppMessages addClickListener:[RCTOneSignal sharedInstance]];
    _hasAddedInAppMessageClickListener = true;
  }
}

RCT_EXPORT_METHOD(addInAppMessagesLifecycleListener) {
  if (!_hasAddedInAppMessageLifecycleListener) {
    [OneSignal.InAppMessages
        addLifecycleListener:[RCTOneSignal sharedInstance]];
    _hasAddedInAppMessageLifecycleListener = true;
  }
}

// OneSignal.Location namespace methods
RCT_REMAP_METHOD(isLocationShared,
                 isLocationSharedResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@([OneSignal.Location isShared]));
}

RCT_EXPORT_METHOD(setLocationShared : (BOOL)shared) {
  [OneSignal.Location setShared:shared];
}

RCT_EXPORT_METHOD(requestLocationPermission) {
  [OneSignal.Location requestPermission];
}

// OneSignal.Notifications namespace methods
RCT_REMAP_METHOD(hasNotificationPermission,
                 hasNotificationPermissionResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@([OneSignal.Notifications permission]));
}

RCT_REMAP_METHOD(
    canRequestNotificationPermission,
    canRequestNotificationPermissionResolver : (RCTPromiseResolveBlock)
        resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@([OneSignal.Notifications canRequestPermission]));
}

RCT_REMAP_METHOD(
    requestNotificationPermission,
    withFallBackSettings : fallbackToSettings
        requestNotificationPermissionResolver : (RCTPromiseResolveBlock)
            resolve rejecter : (RCTPromiseRejectBlock)reject) {
  [OneSignal.Notifications
       requestPermission:^(BOOL accepted) {
         resolve(@(accepted));
       }
      fallbackToSettings:[fallbackToSettings boolValue]];
}

RCT_EXPORT_METHOD(registerForProvisionalAuthorization : (RCTResponseSenderBlock)
                      callback) {
  [OneSignal.Notifications
      registerForProvisionalAuthorization:^(BOOL accepted) {
        callback(@[ @(accepted) ]);
      }];
}

RCT_EXPORT_METHOD(addPermissionObserver) {
  if (!_hasSetPermissionObserver) {
    [OneSignal.Notifications
        addPermissionObserver:[RCTOneSignal sharedInstance]];
    _hasSetPermissionObserver = true;
  }
}

RCT_EXPORT_METHOD(removePermissionObserver) {
  if (_hasSetPermissionObserver) {
    [OneSignal.Notifications
        removePermissionObserver:[RCTOneSignal sharedInstance]];
    _hasSetPermissionObserver = false;
  }
}

RCT_REMAP_METHOD(permissionNative,
                 getPermissionNativeResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@([OneSignal.Notifications permissionNative]));
}

RCT_EXPORT_METHOD(addNotificationClickListener) {
  if (!_hasAddedNotificationClickListener) {
    [OneSignal.Notifications addClickListener:[RCTOneSignal sharedInstance]];
    _hasAddedNotificationClickListener = true;
  }
}

RCT_EXPORT_METHOD(addNotificationForegroundLifecycleListener) {
  if (!_hasAddedNotificationForegroundLifecycleListener) {
    [OneSignal.Notifications addForegroundLifecycleListener:self];
    _hasAddedNotificationForegroundLifecycleListener = true;
  }
}

RCT_EXPORT_METHOD(onWillDisplayNotification : (OSNotificationWillDisplayEvent *)
                      event) {
  __weak RCTOneSignalEventEmitter *weakSelf = self;
  RCTOneSignalEventEmitter *strongSelf = weakSelf;
  if (!strongSelf)
    return;

  strongSelf->_notificationWillDisplayCache[event.notification.notificationId] =
      event;
  [event preventDefault];
  [RCTOneSignalEventEmitter
      sendEventWithName:@"OneSignal-notificationWillDisplayInForeground"
               withBody:[event.notification jsonRepresentation]];
}

RCT_EXPORT_METHOD(preventDefault : (NSString *)notificationId) {
  __weak RCTOneSignalEventEmitter *weakSelf = self;
  RCTOneSignalEventEmitter *strongSelf = weakSelf;
  OSNotificationWillDisplayEvent *event =
      _notificationWillDisplayCache[notificationId];
  if (!event) {
    [OneSignalLog
        onesignalLog:ONE_S_LL_ERROR
             message:[NSString
                         stringWithFormat:
                             @"OneSignal (objc): could not find notification "
                             @"will display event for notification with id: %@",
                             notificationId]];
    return;
  }
  strongSelf->_preventDefaultCache[event.notification.notificationId] = event;
  [event preventDefault];
}

RCT_EXPORT_METHOD(clearAllNotifications) { [OneSignal.Notifications clearAll]; }

// OneSignal.Session namespace methods
RCT_EXPORT_METHOD(addOutcome : (NSString *)name) {
  [OneSignal.Session addOutcome:name];
}

RCT_EXPORT_METHOD(addUniqueOutcome : (NSString *)name) {
  [OneSignal.Session addUniqueOutcome:name];
}

RCT_EXPORT_METHOD(addOutcomeWithValue : (NSString *)name : (NSNumber *_Nonnull)
                      value) {
  [OneSignal.Session addOutcomeWithValue:name value:value];
}

// OneSignal.User namespace methods
RCT_EXPORT_METHOD(addUserStateObserver) {
  if (!_hasSetUserStateObserver) {
    [OneSignal.User addObserver:[RCTOneSignal sharedInstance]];
    _hasSetUserStateObserver = true;
  }
}

RCT_EXPORT_METHOD(addPushSubscriptionObserver) {
  if (!_hasSetSubscriptionObserver) {
    [OneSignal.User.pushSubscription addObserver:[RCTOneSignal sharedInstance]];
    _hasSetSubscriptionObserver = true;
  }
}

RCT_EXPORT_METHOD(removePushSubscriptionObserver) {
  if (_hasSetSubscriptionObserver) {
    [OneSignal.User.pushSubscription
        removeObserver:[RCTOneSignal sharedInstance]];
    _hasSetSubscriptionObserver = false;
  }
}

RCT_EXPORT_METHOD(setLanguage : (NSString *)language) {
  [OneSignal.User setLanguage:language];
}

RCT_EXPORT_METHOD(addEmail : (NSString *)email) {
  [OneSignal.User addEmail:email];
}

RCT_EXPORT_METHOD(removeEmail : (NSString *)email) {
  [OneSignal.User removeEmail:email];
}

RCT_EXPORT_METHOD(addSms : (NSString *)smsNumber) {
  [OneSignal.User addSms:smsNumber];
}

RCT_EXPORT_METHOD(removeSms : (NSString *)smsNumber) {
  [OneSignal.User removeSms:smsNumber];
}

RCT_EXPORT_METHOD(addTag : (NSString *)key value : (id)value) {
  [OneSignal.User addTagWithKey:key value:value];
}

RCT_EXPORT_METHOD(addTags : (NSDictionary *)tags) {
  [OneSignal.User addTags:tags];
}

RCT_EXPORT_METHOD(removeTag : (NSString *)key) {
  [OneSignal.User removeTag:key];
}

RCT_EXPORT_METHOD(removeTags : (NSArray *)keys) {
  [OneSignal.User removeTags:keys];
}

RCT_EXPORT_METHOD(getTags : (RCTPromiseResolveBlock)
                      resolve rejecter : (RCTPromiseRejectBlock)reject) {
  NSDictionary<NSString *, NSString *> *tags = [OneSignal.User getTags];
  resolve(tags);
}

RCT_REMAP_METHOD(getOnesignalId,
                 getOnesignalIdResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  NSString *onesignalId = OneSignal.User.onesignalId;

  if (onesignalId == nil || [onesignalId length] == 0) {
    resolve([NSNull null]); // Resolve with null if nil or empty
  } else {
    resolve(onesignalId);
  }
}

RCT_REMAP_METHOD(getExternalId,
                 getExternalIdResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  NSString *externalId = OneSignal.User.externalId;

  if (externalId == nil || [externalId length] == 0) {
    resolve([NSNull null]); // Resolve with null if nil or empty
  } else {
    resolve(externalId);
  }
}

RCT_EXPORT_METHOD(addAlias : (NSString *)label : (NSString *)id) {
  [OneSignal.User addAliasWithLabel:label id:id];
}

RCT_EXPORT_METHOD(removeAlias : (NSString *)label) {
  [OneSignal.User removeAlias:label];
}

RCT_EXPORT_METHOD(addAliases : (NSDictionary *)aliases) {
  [OneSignal.User addAliases:aliases];
}

RCT_EXPORT_METHOD(removeAliases : (NSArray *)labels) {
  [OneSignal.User removeAliases:labels];
}

// OneSignal.User.pushSubscription namespace methods
RCT_REMAP_METHOD(getOptedIn,
                 getOptedInResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  resolve(@(OneSignal.User.pushSubscription.optedIn));
}

RCT_REMAP_METHOD(getPushSubscriptionId,
                 getPushSubscriptionIdResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  NSString *pushId = OneSignal.User.pushSubscription.id;
  if (pushId && ![pushId isEqualToString:@""]) {
    resolve(pushId);
  } else {
    resolve([NSNull null]);
  }
}

RCT_REMAP_METHOD(getPushSubscriptionToken,
                 getPushSubscriptionTokenResolver : (RCTPromiseResolveBlock)
                     resolve rejecter : (RCTPromiseRejectBlock)reject) {
  NSString *token = OneSignal.User.pushSubscription.token;
  if (token && ![token isEqualToString:@""]) {
    resolve(token);
  } else {
    resolve([NSNull null]);
  }
}

RCT_EXPORT_METHOD(optIn) { [OneSignal.User.pushSubscription optIn]; }

RCT_EXPORT_METHOD(optOut) { [OneSignal.User.pushSubscription optOut]; }

RCT_EXPORT_METHOD(displayNotification : (NSString *)notificationId) {
  OSNotificationWillDisplayEvent *event =
      _notificationWillDisplayCache[notificationId];
  if (!event) {
    [OneSignalLog
        onesignalLog:ONE_S_LL_ERROR
             message:[NSString
                         stringWithFormat:
                             @"OneSignal (objc): could not find notification "
                             @"will display event for notification with id: %@",
                             notificationId]];
    return;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
    [event.notification display];
  });

  [_preventDefaultCache removeObjectForKey:notificationId];
  [_notificationWillDisplayCache removeObjectForKey:notificationId];
}

RCT_EXPORT_METHOD(initInAppMessageClickHandlerParams) {
  // iOS Stub
}

- (void)removeObservers {
  [self removePermissionObserver];
  [self removePushSubscriptionObserver];
  [self removeUserStateObserver];
}

- (void)removeHandlers {
  if (_hasAddedInAppMessageClickListener) {
    [OneSignal.InAppMessages removeClickListener:[RCTOneSignal sharedInstance]];
    _hasAddedInAppMessageClickListener = false;
  }
  if (_hasAddedInAppMessageLifecycleListener) {
    [OneSignal.InAppMessages
        removeLifecycleListener:[RCTOneSignal sharedInstance]];
    _hasAddedInAppMessageLifecycleListener = false;
  }
  if (_hasAddedNotificationClickListener) {
    [OneSignal.Notifications removeClickListener:[RCTOneSignal sharedInstance]];
    _hasAddedNotificationClickListener = false;
  }
  if (_hasAddedNotificationForegroundLifecycleListener) {
    [OneSignal.Notifications removeForegroundLifecycleListener:self];
    _hasAddedNotificationForegroundLifecycleListener = false;
  }
}

- (void)removeUserStateObserver {
  if (_hasSetUserStateObserver) {
    [OneSignal.User removeObserver:[RCTOneSignal sharedInstance]];
    _hasSetUserStateObserver = false;
  }
}

@end

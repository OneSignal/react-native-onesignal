#import "RCTOneSignal.h"
#import "RCTOneSignalEventEmitter.h"

@interface RCTOneSignal ()
@end

@implementation RCTOneSignal {
  BOOL didInitialize;
}

+ (RCTOneSignal *)sharedInstance {
  static dispatch_once_t token = 0;
  static id _sharedInstance = nil;
  dispatch_once(&token, ^{
    _sharedInstance = [[RCTOneSignal alloc] init];
  });
  return _sharedInstance;
}

- (void)initOneSignal:(NSDictionary *)launchOptions {

  if (didInitialize)
    return;

  OneSignalWrapper.sdkType = @"reactnative";
  OneSignalWrapper.sdkVersion = @"050404";
  // initialize the SDK with a nil app ID so cold start click listeners can be
  // triggered
  [OneSignal initialize:nil withLaunchOptions:launchOptions];
  didInitialize = true;
}

- (void)sendEvent:(NSString *)eventName withBody:(NSDictionary *)body {
  [RCTOneSignalEventEmitter sendEventWithName:eventName withBody:body];
}

- (void)onUserStateDidChangeWithState:(OSUserChangedState *_Nonnull)state {
  NSString *onesignalId = state.current.onesignalId;
  NSString *externalId = state.current.externalId;

  NSMutableDictionary *currentDictionary = [NSMutableDictionary dictionary];

  if (onesignalId.length > 0) {
    [currentDictionary setObject:onesignalId forKey:@"onesignalId"];
  } else {
    [currentDictionary setObject:[NSNull null] forKey:@"onesignalId"];
  }

  if (externalId.length > 0) {
    [currentDictionary setObject:externalId forKey:@"externalId"];
  } else {
    [currentDictionary setObject:[NSNull null] forKey:@"externalId"];
  }

  NSDictionary *result = @{@"current" : currentDictionary};

  [self sendEvent:OSEventString(UserStateChanged) withBody:result];
}

- (void)onPushSubscriptionDidChangeWithState:
    (OSPushSubscriptionChangedState *_Nonnull)state {
  NSMutableDictionary *result = [NSMutableDictionary new];

  // Previous state
  NSMutableDictionary *previousObject = [NSMutableDictionary new];
  previousObject[@"token"] =
      (state.previous.token && ![state.previous.token isEqualToString:@""])
          ? state.previous.token
          : [NSNull null];
  previousObject[@"id"] =
      (state.previous.id && ![state.previous.id isEqualToString:@""])
          ? state.previous.id
          : [NSNull null];
  previousObject[@"optedIn"] = @(state.previous.optedIn);
  result[@"previous"] = previousObject;

  // Current state
  NSMutableDictionary *currentObject = [NSMutableDictionary new];
  currentObject[@"token"] =
      (state.current.token && ![state.current.token isEqualToString:@""])
          ? state.current.token
          : [NSNull null];
  currentObject[@"id"] =
      (state.current.id && ![state.current.id isEqualToString:@""])
          ? state.current.id
          : [NSNull null];
  currentObject[@"optedIn"] = @(state.current.optedIn);
  result[@"current"] = currentObject;

  [self sendEvent:OSEventString(SubscriptionChanged) withBody:result];
}

- (void)onNotificationPermissionDidChange:(BOOL)permission {
  [self sendEvent:OSEventString(PermissionChanged)
         withBody:@{@"permission" : @(permission)}];
}

- (void)onClickNotification:(OSNotificationClickEvent *_Nonnull)event {
  [self sendEvent:OSEventString(NotificationClicked)
         withBody:[event jsonRepresentation]];
}

- (void)onClickInAppMessage:(OSInAppMessageClickEvent *_Nonnull)event {
  [self sendEvent:OSEventString(InAppMessageClicked)
         withBody:[event jsonRepresentation]];
}

- (void)onWillDisplayInAppMessage:
    (OSInAppMessageWillDisplayEvent *_Nonnull)event {
  [self sendEvent:OSEventString(InAppMessageWillDisplay)
         withBody:[event jsonRepresentation]];
}

- (void)onDidDisplayInAppMessage:
    (OSInAppMessageDidDisplayEvent *_Nonnull)event {
  [self sendEvent:OSEventString(InAppMessageDidDisplay)
         withBody:[event jsonRepresentation]];
}

- (void)onWillDismissInAppMessage:
    (OSInAppMessageWillDismissEvent *_Nonnull)event {
  [self sendEvent:OSEventString(InAppMessageWillDismiss)
         withBody:[event jsonRepresentation]];
}

- (void)onDidDismissInAppMessage:
    (OSInAppMessageDidDismissEvent *_Nonnull)event {
  [self sendEvent:OSEventString(InAppMessageDidDismiss)
         withBody:[event jsonRepresentation]];
}

@end

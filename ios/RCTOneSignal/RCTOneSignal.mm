#if __has_include(<React/RCTConvert.h>)
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTUtils.h>
#else
#import "RCTBridge.h"
#import "RCTConvert.h"
#import "RCTEventDispatcher.h"
#import "RCTUtils.h"
#endif

#import "RCTOneSignal.h"
#import "RCTOneSignalEventEmitter.h"

#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_8_0

#define UIUserNotificationTypeAlert UIRemoteNotificationTypeAlert
#define UIUserNotificationTypeBadge UIRemoteNotificationTypeBadge
#define UIUserNotificationTypeSound UIRemoteNotificationTypeSound
#define UIUserNotificationTypeNone UIRemoteNotificationTypeNone
#define UIUserNotificationType UIRemoteNotificationType

#endif

@interface RCTOneSignal ()
@end

@implementation RCTOneSignal {
  BOOL didInitialize;
}

OSNotificationClickResult *coldStartOSNotificationClickResult;

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
  OneSignalWrapper.sdkVersion = @"050213";
  // initialize the SDK with a nil app ID so cold start click listeners can be
  // triggered
  [OneSignal initialize:nil withLaunchOptions:launchOptions];
  didInitialize = true;
}

- (void)handleRemoteNotificationOpened:(NSString *)result {
  NSDictionary *json = [self jsonObjectWithString:result];

  if (json) {
    [self sendEvent:OSEventString(NotificationClicked) withBody:json];
  }
}

- (NSDictionary *)jsonObjectWithString:(NSString *)jsonString {
  NSError *jsonError;
  NSData *data = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
  NSDictionary *json =
      [NSJSONSerialization JSONObjectWithData:data
                                      options:NSJSONReadingMutableContainers
                                        error:&jsonError];

  if (jsonError) {
    return nil;
  }

  return json;
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

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

@end

#import <OneSignalFramework/OneSignalFramework.h>

#import "RCTOneSignalExtensionService.h"

@implementation RCTOneSignalExtensionService

// forwards OneSignal notification extension requests
+ (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                          withContent:
                              (UNMutableNotificationContent *_Nullable)content {
  [OneSignal didReceiveNotificationExtensionRequest:request
                     withMutableNotificationContent:content];
}

+ (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                          withContent:
                              (UNMutableNotificationContent *_Nullable)content
                   withContentHandler:
                       (void (^)(UNNotificationContent *_Nonnull))
                           contentHandler {
  [OneSignal didReceiveNotificationExtensionRequest:request
                     withMutableNotificationContent:content
                                 withContentHandler:contentHandler];
}

+ (void)serviceExtensionTimeWillExpireRequest:(UNNotificationRequest *)request
               withMutableNotificationContent:
                   (UNMutableNotificationContent *_Nullable)content {
  [OneSignal serviceExtensionTimeWillExpireRequest:request
                    withMutableNotificationContent:content];
}
@end

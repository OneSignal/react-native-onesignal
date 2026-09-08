#import <OneSignalFramework/OneSignalFramework.h>

#import "RCTOneSignalExtensionService.h"

@implementation RCTOneSignalExtensionService

// forwards OneSignal notification extension requests
+ (void)didReceiveNotificationRequest:(UNNotificationRequest *)request
                          withContent:
                              (UNMutableNotificationContent *_Nullable)content {
  // OneSignal 5.6.0 removed the 2-arg selector; nil handler is the old sync path.
  [OneSignal didReceiveNotificationExtensionRequest:request
                     withMutableNotificationContent:content
                                 withContentHandler:nil];
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

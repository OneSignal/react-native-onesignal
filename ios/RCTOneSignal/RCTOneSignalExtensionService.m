//
//  RCTOneSignalExtensionService.m
//  RCTOneSignal
//
//  Created by Brad Hesse on 1/17/18.
//

#if __has_include(<OneSignal/OneSignal.h>)
#import <OneSignal/OneSignal.h>
#else
#import "OneSignal.h"
#endif

#import "RCTOneSignalExtensionService.h"

@implementation RCTOneSignalExtensionService

//forwards OneSignal notification extension requests
+(void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContent:(UNMutableNotificationContent * _Nullable)content {
    [OneSignal didReceiveNotificationExtensionRequest:request withMutableNotificationContent:content];
}

+(void)serviceExtensionTimeWillExpireRequest:(UNNotificationRequest *)request withMutableNotificationContent:(UNMutableNotificationContent * _Nullable)content {
    [OneSignal serviceExtensionTimeWillExpireRequest:request withMutableNotificationContent:content];
}
@end

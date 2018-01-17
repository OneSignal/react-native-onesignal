//
//  RCTOneSignalExtensionService.h
//  RCTOneSignal
//
//  Created by Brad Hesse on 1/17/18.
//

#import <Foundation/Foundation.h>
#import <UserNotifications/UserNotifications.h>

@interface RCTOneSignalExtensionService : NSObject
+ (void)serviceExtensionTimeWillExpireRequest:(UNNotificationRequest *)request withMutableNotificationContent:(UNMutableNotificationContent *)content;
+ (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContent:(UNMutableNotificationContent *)content;
@end

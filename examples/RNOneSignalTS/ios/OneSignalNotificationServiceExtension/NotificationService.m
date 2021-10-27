#import <OneSignal/OneSignal.h>

#import "NotificationService.h"

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNNotificationRequest *receivedRequest;
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.receivedRequest = request;
    self.contentHandler = contentHandler;
    self.bestAttemptContent = [request.content mutableCopy];
    
    //If your SDK version is < 3.5.0 uncomment and use this code:
    /*
    [OneSignal didReceiveNotificationExtensionRequest:self.receivedRequest
                       withMutableNotificationContent:self.bestAttemptContent];
    self.contentHandler(self.bestAttemptContent);
    */
    
    /* DEBUGGING: Uncomment the 2 lines below and comment out the one above to ensure this extension is excuting
                  Note, this extension only runs when mutable-content is set
                  Setting an attachment or action buttons automatically adds this */
    // NSLog(@"Running NotificationServiceExtension");
    // self.bestAttemptContent.body = [@"[Modified] " stringByAppendingString:self.bestAttemptContent.body];
    
    // Uncomment this line to set the default log level of NSE to VERBOSE so we get all logs from NSE logic
    //[OneSignal setLogLevel:ONE_S_LL_VERBOSE visualLevel:ONE_S_LL_NONE];
    [OneSignal didReceiveNotificationExtensionRequest:self.receivedRequest
                       withMutableNotificationContent:self.bestAttemptContent
                                   withContentHandler:self.contentHandler];
}

- (void)serviceExtensionTimeWillExpire {
    // Called just before the extension will be terminated by the system.
    // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
    
    [OneSignal serviceExtensionTimeWillExpireRequest:self.receivedRequest withMutableNotificationContent:self.bestAttemptContent];
    
    self.contentHandler(self.bestAttemptContent);
}

@end

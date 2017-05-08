//
//  NSString+OneSignal.h
//
//  Created by James on 16/3/2017.
//
//

#import <Foundation/Foundation.h>

#ifndef NSString_OneSignal_h
#define NSString_OneSignal_h
@interface NSString (OneSignal)

- (NSString*)one_getVersionForRange:(NSRange)range;
- (NSString*)one_substringAfter:(NSString *)needle;
- (NSString*)one_getSemanticVersion;

@end
#endif

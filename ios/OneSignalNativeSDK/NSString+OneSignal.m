//
//  NSString+OneSignal.m
//
//  Created by James on 16/3/2017.
//
//

#import "NSString+OneSignal.h"

@implementation NSString (OneSignal)


- (NSString *)one_substringAfter:(NSString *)needle
{
	NSRange r = [self rangeOfString:needle];
	if (r.location == NSNotFound) return self;
	return [self substringFromIndex:(r.location + r.length)];
}


- (NSString*)one_getVersionForRange:(NSRange)range {

	unichar myBuffer[2];
	[self getCharacters:myBuffer range:range];
	NSString *ver = [NSString stringWithCharacters:myBuffer length:2];
	if([ver hasPrefix:@"0"]){
		return [ver one_substringAfter:@"0"];
	}
	else{
		return ver;
	}
}

- (NSString*)one_getSemanticVersion {

	NSMutableString *tmpstr = [[NSMutableString alloc] initWithCapacity:5];

	for ( int i = 0; i <=4; i+=2 ){
		[tmpstr appendString:[self one_getVersionForRange:NSMakeRange(i, 2)]];
		if (i != 4)[tmpstr appendString:@"."];
	}

	return (NSString*)tmpstr;
}


@end

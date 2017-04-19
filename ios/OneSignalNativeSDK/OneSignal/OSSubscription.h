/**
 * Modified MIT License
 *
 * Copyright 2017 OneSignal
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * 1. The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * 2. All copies of substantial portions of the Software may only be used in connection
 * with services provided by OneSignal.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
#import <Foundation/Foundation.h>

#import "OneSignal.h"

#import "OSObservable.h"

#import "OSPermission.h"

// Redefines are done so we can make properites writeable and backed internal variables accesiable to the SDK.
// Basicly the C# equivlent of a public gettter with an internal settter.


@protocol OSSubscriptionStateObserver
-(void)onChanged:(OSSubscriptionState*)state;
@end

typedef OSObservable<NSObject<OSSubscriptionStateObserver>*, OSSubscriptionState*> ObserableSubscriptionStateType;

// Redefine OSSubscriptionState
@interface OSSubscriptionState () {
@protected BOOL _userSubscriptionSetting;
@protected NSString* _userId;
@protected NSString* _pushToken;
}

// @property (readonly, nonatomic) BOOL subscribed; // (yes only if userId, pushToken, and setSubscription exists / are true)
@property (readwrite, nonatomic) BOOL userSubscriptionSetting; // returns setSubscription state.
@property (readwrite, nonatomic) NSString* userId;    // AKA OneSignal PlayerId
@property (readwrite, nonatomic) NSString* pushToken; // AKA Apple Device Token
@property (nonatomic) ObserableSubscriptionStateType* observable;

- (instancetype)initAsToWithPermision:(BOOL)permission;
- (instancetype)initAsFrom;

@end


// Redefine OSSubscriptionState
@interface OSSubscriptionState () <OSPermissionStateObserver>

@property (nonatomic) BOOL accpeted;

- (void)setAccepted:(BOOL)inAccpeted;
- (void)persistAsFrom;
- (BOOL)compare:(OSSubscriptionState*)from;
@end

// Redefine OSSubscriptionStateChanges
@interface OSSubscriptionStateChanges ()

@property (readwrite) OSSubscriptionState* to;
@property (readwrite) OSSubscriptionState* from;

@end


typedef OSObservable<NSObject<OSSubscriptionObserver>*, OSSubscriptionStateChanges*> ObserableSubscriptionStateChangesType;


@interface OSSubscriptionChangedInternalObserver : NSObject<OSSubscriptionStateObserver>
+ (void)fireChangesObserver:(OSSubscriptionState*)state;
@end

@interface OneSignal (SubscriptionAdditions)

@property (class) OSSubscriptionState* lastSubscriptionState;
@property (class) OSSubscriptionState* currentSubscriptionState;

// Used to manage observers added by the app developer.
@property (class) ObserableSubscriptionStateChangesType* subscriptionStateChangesObserver;

@end

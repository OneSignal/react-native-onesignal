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
#import "OSObservable.h"

#import "OneSignalHelper.h"

@implementation OSObservable {
NSHashTable* observers;
SEL changeSelector;
}

- (instancetype)initWithChangeSelector:(SEL)selector {
    if (self = [super init]) {
        observers = [NSHashTable weakObjectsHashTable];
        changeSelector = selector;
    }
    return self;
}

- (instancetype)init {
    if (self = [super init])
        observers = [NSHashTable new];
    return self;
}

- (void)addObserver:(id)observer {
    [observers addObject:observer];
}

- (void)removeObserver:(id)observer {
    [observers removeObject:observer];
}

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Warc-performSelector-leaks"

- (BOOL)notifyChange:(id)state {
    BOOL fired = false;
     for (id observer in observers) {
         fired = true;
         if (changeSelector) {
             // Any Obserable setup to fire a custom selector with changeSelector
             //  is external to our SDK. Run on the main thread in case the
             //  app developer needs to update UI elements.
             [OneSignalHelper dispatch_async_on_main_queue: ^{
                 [observer performSelector:changeSelector withObject:state];
             }];
         }
         else
             [observer onChanged:state];
     }
    
    return fired;
}

#pragma clang diagnostic pop

@end

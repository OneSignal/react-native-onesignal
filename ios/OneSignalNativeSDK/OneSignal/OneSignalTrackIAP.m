/**
 * Modified MIT License
 *
 * Copyright 2016 OneSignal
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
#import <objc/runtime.h>
#import "OneSignalTrackIAP.h"
#import "OneSignal.h"

@implementation OneSignalTrackIAP

static Class skPaymentQueue;
static Class sKProductsRequestClass;
static id productsRequest;
NSMutableDictionary* skusToTrack;

// NSClassFromString and performSelector are used so OneSignal does not depend on StoreKit to link the app.
// Suppressing undeclared selector warnings
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wundeclared-selector"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wundeclared-selector"


+ (BOOL)canTrack {
    skPaymentQueue = NSClassFromString(@"SKPaymentQueue");
    return (skPaymentQueue != nil && [skPaymentQueue performSelector:@selector(canMakePayments)]);
}

- (id)init {
    self = [super init];
    
    if (self)
        [[skPaymentQueue performSelector:@selector(defaultQueue)] performSelector:@selector(addTransactionObserver:) withObject:self];
    
    return self;
}

- (void)dealloc {
  if (skPaymentQueue) {
    [[skPaymentQueue performSelector:@selector(defaultQueue)] performSelector:@selector(removeTransactionObserver:) withObject:self];
      if (productsRequest) {
          [productsRequest setDelegate:nil];
          SEL selector = NSSelectorFromString(@"cancel");
          ((void (*)(id, SEL))[productsRequest methodForSelector:selector])(productsRequest, selector);
          
          productsRequest = nil;
      }
  }
}

- (void)paymentQueue:(id)queue updatedTransactions:(NSArray*)transactions {
    skusToTrack = [NSMutableDictionary new];
    id skPayment;
    
    for (id transaction in transactions) {
        NSInteger state = (NSInteger)[transaction performSelector:@selector(transactionState)];
        switch (state) {
            case 1: // SKPaymentTransactionStatePurchased
                skPayment = [transaction performSelector:@selector(payment)];
                NSString* sku = [skPayment performSelector:@selector(productIdentifier)];
                NSInteger quantity = (NSInteger)[skPayment performSelector:@selector(quantity)];
                
                if (skusToTrack[sku])
                    [skusToTrack[sku] setObject:[NSNumber numberWithInt:[skusToTrack[sku][@"count"] intValue] + (int)quantity] forKey:@"count"];
                else
                    skusToTrack[sku] = [NSMutableDictionary dictionaryWithObjectsAndKeys:[NSNumber numberWithInteger:quantity], @"count", nil];
                break;
        }
    }
    
    if (skusToTrack.count > 0)
        [self getProductInfo:[skusToTrack allKeys]];
}


- (void)getProductInfo:(NSArray*)productIdentifiers {
    sKProductsRequestClass = NSClassFromString(@"SKProductsRequest");
    productsRequest = [[sKProductsRequestClass alloc] performSelector:@selector(initWithProductIdentifiers:) withObject:[NSSet setWithArray:productIdentifiers]];
    [productsRequest setDelegate:(id)self];
    
    // [productsRequest performSelector:NSSelectorFromString(@"start")];
    SEL selector = NSSelectorFromString(@"start");
    ((void (*)(id, SEL))[productsRequest methodForSelector:selector])(productsRequest, selector);
}

- (void)productsRequest:(id)request didReceiveResponse:(id)response {
    NSMutableArray* arrayOfPruchases = [NSMutableArray new];
    
    for(id skProduct in [response performSelector:@selector(products)]) {
        NSString* productSku = [skProduct performSelector:@selector(productIdentifier)];
        NSMutableDictionary* purchase = skusToTrack[productSku];
        if (purchase) { // In rare cases this can be nil when there wasn't a connection to Apple when opening the app but there was when buying an IAP item.
            purchase[@"sku"] = productSku;
            purchase[@"amount"] = [skProduct performSelector:@selector(price)];
            purchase[@"iso"] = [[skProduct performSelector:@selector(priceLocale)] objectForKey:NSLocaleCurrencyCode];
            if ([purchase[@"count"] intValue] == 1)
                [purchase removeObjectForKey:@"count"];
            [arrayOfPruchases addObject:purchase];
        }
    }
    
    if ([arrayOfPruchases count] > 0)
        [[OneSignal class] performSelector:@selector(sendPurchases:) withObject:arrayOfPruchases];
}

#pragma clang diagnostic pop
#pragma GCC diagnostic pop



@end

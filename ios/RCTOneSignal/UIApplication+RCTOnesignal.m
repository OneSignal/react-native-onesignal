#import <UIKit/UIKit.h>
#import <objc/runtime.h>

@interface RCTOneSignal
+ (RCTOneSignal *) sharedInstance;
- (void)initOneSignal:(NSDictionary *)launchOptions;
@end

@implementation UIApplication(OneSignalReactNative)

/*
    This UIApplication category ensures that OneSignal init() gets called at least one time

    If this did not occur, cold-start notifications would not trigger the React-Native 'opened'
    event and other miscellaneous problems would occur.

    First, we swizzle UIApplication's setDelegate method, to get notified when the app delegate
    is assigned. Then we swizzle UIApplication's didFinishLaunchingWithOptions() method. When
    this method gets called, it initializes the OneSignal SDK with a nil app ID.
*/

//helper method to swizzle instance methods
static void injectSelector(Class newClass, SEL newSel, Class addToClass, SEL makeLikeSel) {
    Method newMeth = class_getInstanceMethod(newClass, newSel);
    IMP imp = method_getImplementation(newMeth);
    const char* methodTypeEncoding = method_getTypeEncoding(newMeth);

    BOOL successful = class_addMethod(addToClass, makeLikeSel, imp, methodTypeEncoding);
    if (!successful) {
        class_addMethod(addToClass, newSel, imp, methodTypeEncoding);
        newMeth = class_getInstanceMethod(addToClass, newSel);

        Method orgMeth = class_getInstanceMethod(addToClass, makeLikeSel);

        method_exchangeImplementations(orgMeth, newMeth);
    }
}

//gets called by the ObjC runtime early in the app lifecycle
+ (void)load {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        method_exchangeImplementations(class_getInstanceMethod(self, @selector(setDelegate:)), class_getInstanceMethod(self, @selector(setOneSignalReactNativeDelegate:)));
    });
}


- (void) setOneSignalReactNativeDelegate:(id<UIApplicationDelegate>)delegate {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        Class delegateClass = [delegate class];
        injectSelector(self.class, @selector(oneSignalApplication:didFinishLaunchingWithOptions:),
                       delegateClass, @selector(application:didFinishLaunchingWithOptions:));
        [self setOneSignalReactNativeDelegate:delegate];
    });
}

- (BOOL)oneSignalApplication:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions {
    [[RCTOneSignal sharedInstance] initOneSignal:launchOptions];
    if ([self respondsToSelector:@selector(oneSignalApplication:didFinishLaunchingWithOptions:)])
        return [self oneSignalApplication:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
}

@end

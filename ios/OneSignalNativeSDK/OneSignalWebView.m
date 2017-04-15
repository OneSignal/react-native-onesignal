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

#import <UIKit/UIKit.h>
#import "OneSignalWebView.h"
#import "OneSignal.h"

@interface OneSignal ()
+ (void) onesignal_Log:(ONE_S_LOG_LEVEL)logLevel message:(NSString*) message;
@end

@implementation OneSignalWebView

UINavigationController *navController;
UIViewController *viewControllerForPresentation;

-(void)viewDidLoad {
    _webView = [[UIWebView alloc] initWithFrame:self.view.frame];
    _webView.delegate = self;
    [self.view addSubview:_webView];
    
    [self.view setBackgroundColor:[UIColor blackColor]];
    
    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(dismiss:)];
    
    _uiBusy = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhite];
    _uiBusy.color = [UIColor blackColor];
    _uiBusy.hidesWhenStopped = YES;
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithCustomView:_uiBusy];
}


-(void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    if (_url)
        [_webView loadRequest:[NSURLRequest requestWithURL:_url]];
}


-(void)dismiss:(id)sender {
    [self.navigationController dismissViewControllerAnimated:true completion:^{
        //clear web view
        [_webView loadHTMLString:@"" baseURL:nil];
        if (viewControllerForPresentation)
           [viewControllerForPresentation.view removeFromSuperview];
    }];
}

-(void)webViewDidStartLoad:(UIWebView *)webView {
    [_uiBusy startAnimating];
}

-(void)webViewDidFinishLoad:(UIWebView *)webView {
    self.title = [_webView stringByEvaluatingJavaScriptFromString:@"document.title"];
    self.navigationController.title = self.title;
    [_uiBusy stopAnimating];
}

-(void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [OneSignal onesignal_Log:ONE_S_LL_ERROR message:error.localizedDescription];
}


-(void)showInApp {
    // if already presented, no need to present again
    if (!navController) {
        navController = [[UINavigationController alloc] initWithRootViewController:self];
        navController.modalTransitionStyle = UIModalTransitionStyleCoverVertical;
    }
    if (!viewControllerForPresentation) {
        viewControllerForPresentation = [[UIViewController alloc] init];
        [[viewControllerForPresentation view] setBackgroundColor:[UIColor clearColor]];
        [[viewControllerForPresentation view] setOpaque:FALSE];
    }
    
    if (navController.isViewLoaded && navController.view.window) {
        // navController is visible only refresh webview
        if (_url)
            [_webView loadRequest:[NSURLRequest requestWithURL:_url]];
        return;
    }
    
    UIWindow* mainWindow = [[UIApplication sharedApplication] keyWindow];
    
    if (!viewControllerForPresentation.view.superview)
        [mainWindow addSubview:[viewControllerForPresentation view]];

    @try {
       [viewControllerForPresentation presentViewController:navController animated:YES completion:nil];
    }
    @catch(NSException* exception) { }
}



@end

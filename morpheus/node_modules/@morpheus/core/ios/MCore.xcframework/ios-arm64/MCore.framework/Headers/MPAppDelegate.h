//
//  MPAppDelegate.h
//
//  Created by 정종현 on 2024/06/03.
//

#import <Foundation/Foundation.h>

@interface MPAppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;
@property (strong, nonatomic) PPNavigationController *navigationController;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions history:(BOOL)history;
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions history:(BOOL)history parameters:(NSDictionary *)parameters;

@end


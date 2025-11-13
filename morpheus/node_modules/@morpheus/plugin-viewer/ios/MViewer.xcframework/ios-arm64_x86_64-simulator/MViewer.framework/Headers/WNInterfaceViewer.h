//
//  WNInterfaceViewer.h
//

#import <UIKit/UIKit.h>

@interface WNInterfaceViewer : NSObject<WNInterface>

- (NSString *)wn2PluginViewerDocOpen:(NSString *)jsonString;

@end

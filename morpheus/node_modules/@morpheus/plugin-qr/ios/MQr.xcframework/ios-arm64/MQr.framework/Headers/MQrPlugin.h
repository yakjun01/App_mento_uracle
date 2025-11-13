//
//  MQrPlugin.h
//

#import <Foundation/Foundation.h>

@interface MQrPlugin : MPlugin

+ (MQrPlugin *)getInstance;

@end

#define PLUGIN_CLASS    MQrPlugin
#define PLUGIN_BUNDLE   @"MQr.bundle"

#define PGResource(res) [PLUGIN_BUNDLE appendPath:res]
#define PGLocalizedString(key, comment) [PLUGIN_CLASS localizedStringForKey:(key)]

//
//  MViewerPlugin.h
//

#import <Foundation/Foundation.h>

@interface MViewerPlugin : NSObject
{
    NSBundle* _bundle;
    NSBundle* _strBundle;
}

@property (nonatomic, retain) NSBundle* bundle;
@property (nonatomic, retain) NSBundle* strBundle;

+ (MViewerPlugin *) getInstance;

+ (NSString *) localizedStringForKey:(NSString *)key;

@end

#define PLUGIN_CLASS    MViewerPlugin
#define PLUGIN_BUNDLE   @"MViewer.bundle"

#define PGResource(res) [PLUGIN_BUNDLE appendPath:res]
#define PGLocalizedString(key, comment) [PLUGIN_CLASS localizedStringForKey:(key)]

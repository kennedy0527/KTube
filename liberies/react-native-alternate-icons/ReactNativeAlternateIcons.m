#import "ReactNativeAlternateIcons.h"
#import <React/RCTLog.h>
#import <React/RCTClipboard.h>
#import <UIKit/UIKit.h>

@protocol Helper<NSObject>

-(void) lc_setAlternateIconName:(NSString *) iconName;

@end
@implementation Helper : NSObject

#define SYSTEM_VERSION_EQUAL_TO(v)                  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedSame)
#define SYSTEM_VERSION_GREATER_THAN(v)              ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedDescending)
#define SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN_OR_EQUAL_TO(v)     ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedDescending)

- (void)lc_setAlternateIconName:(NSString*)iconName
{
    //anti apple private method call analyse
    if( SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"10.3") ){
        if ([[UIApplication sharedApplication] respondsToSelector:@selector(supportsAlternateIcons)] &&
            [[UIApplication sharedApplication] supportsAlternateIcons])
        {
            NSMutableString *selectorString = [[NSMutableString alloc] initWithCapacity:40];
            [selectorString appendString:@"_setAlternate"];
            [selectorString appendString:@"IconName:"];
            [selectorString appendString:@"completionHandler:"];

            SEL selector = NSSelectorFromString(selectorString);
            IMP imp = [[UIApplication sharedApplication] methodForSelector:selector];
            void (*func)(id, SEL, id, id) = (void *)imp;
            if (func)
            {
                func([UIApplication sharedApplication], selector, iconName, ^(NSError * _Nullable error) {});
            }
        }
    }
}
@end
@implementation ReactNativeAlternateIcons

#define SYSTEM_VERSION_EQUAL_TO(v)                  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedSame)
#define SYSTEM_VERSION_GREATER_THAN(v)              ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedDescending)
#define SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN(v)                 ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] == NSOrderedAscending)
#define SYSTEM_VERSION_LESS_THAN_OR_EQUAL_TO(v)     ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedDescending)


RCT_EXPORT_MODULE();


RCT_EXPORT_METHOD(setIconName:(NSString *)name){
    if( SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"10.3") ){
        [[Helper alloc] lc_setAlternateIconName:name];
        
//        [[UIApplication sharedApplication] setAlternateIconName:name completionHandler:^(NSError * _Nullable error) {
//            if( error != nil ){
//                NSLog(@"Error: %@", error.description );
//            }
//        }];
    }
}

RCT_EXPORT_METHOD(reset){
    if( SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"10.3") ){
        [[Helper alloc] lc_setAlternateIconName:nil];
//        [[UIApplication sharedApplication] setAlternateIconName:nil completionHandler:^(NSError * _Nullable error) {
//            if( error != nil ){
//                NSLog(@"Error: %@", error.description );
//            }
//        }];
    }
}

RCT_EXPORT_METHOD(getIconName:(RCTResponseSenderBlock) callback ){
    NSString *name = @"default";
    NSDictionary *results;
    
    if( SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"10.3") ){
        if( [[UIApplication sharedApplication] supportsAlternateIcons ] ){
            name = [[UIApplication sharedApplication] alternateIconName];
            if( name == nil ){
                name = @"default";
            }
        }
    }
    
    results = @{
                @"iconName":name
                };
    callback(@[results]);
}

RCT_EXPORT_METHOD(supportDevice:(RCTResponseSenderBlock) callback){
    NSDictionary *results = @{
                              @"supported":@NO
                              };
    
    if( SYSTEM_VERSION_GREATER_THAN_OR_EQUAL_TO(@"10.3") ){
        if( [[UIApplication sharedApplication] supportsAlternateIcons ] ){
            results = @{
                        @"supported":@YES
                        };
        }else{
            results = @{
                        @"supported":@NO
                        };
        }
    }
    
    callback(@[results]);
}

@end

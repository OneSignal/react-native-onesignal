import WidgetKit
import SwiftUI

@main
struct OneSignalWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        if #available(iOS 16.2, *) {
            OneSignalWidgetLiveActivity()
        }
    }
}

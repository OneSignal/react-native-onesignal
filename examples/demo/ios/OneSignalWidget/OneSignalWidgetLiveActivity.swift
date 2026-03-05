import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

struct OneSignalWidgetAttributes: OneSignalLiveActivityAttributes  {
    public struct ContentState: OneSignalLiveActivityContentState {
        var emoji: String
        var onesignal: OneSignalLiveActivityContentStateData?
    }
    var name: String
    var onesignal: OneSignalLiveActivityAttributeData
}

struct OneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: OneSignalWidgetAttributes.self) { context in
            VStack {
                Text("Hello \(context.attributes.name) \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

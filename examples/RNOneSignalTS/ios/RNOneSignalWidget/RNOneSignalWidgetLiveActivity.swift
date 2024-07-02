//
//  RNOneSignalWidgetLiveActivity.swift
//  RNOneSignalWidget
//
//  Created by Brian Smith on 4/26/24.
//

#if !targetEnvironment(macCatalyst)
import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

struct RNOneSignalWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            // Lock screen/banner UI goes here\VStack(alignment: .leading) {
            VStack {
                Spacer()
                Text("REACT: " + (context.attributes.data["title"]?.asString() ?? "")).font(.headline)
                Spacer()
                HStack {
                    Spacer()
                    Label {
                        Text(context.state.data["message"]?.asDict()?["en"]?.asString() ?? "")
                    } icon: {
                        Image("onesignaldemo")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 40.0, height: 40.0)
                    }
                    Spacer()
                }
                Text("INT: " + String(context.state.data["intValue"]?.asInt() ?? 0))
                Text("DBL: " + String(context.state.data["doubleValue"]?.asDouble() ?? 0.0))
                Text("BOL: " + String(context.state.data["boolValue"]?.asBool() ?? false))
                Spacer()
            }
            .activitySystemActionForegroundColor(.black)
            .activityBackgroundTint(.white)
        } dynamicIsland: { _ in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T")
            } minimal: {
                Text("Min")
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}
#endif

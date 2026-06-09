import ActivityKit
import WidgetKit
import SwiftUI
import OneSignalLiveActivities

@available(iOS 16.2, *)
struct OneSignalWidgetLiveActivity: Widget {

    private func statusIcon(for status: String) -> String {
        switch status {
        case "on_the_way": return "box.truck.fill"
        case "delivered":  return "checkmark.circle.fill"
        default:           return "bag.fill"
        }
    }

    private func statusColor(for status: String) -> Color {
        switch status {
        case "on_the_way": return .blue
        case "delivered":  return .green
        default:           return .orange
        }
    }

    private func statusLabel(for status: String) -> String {
        switch status {
        case "on_the_way": return "On the Way"
        case "delivered":  return "Delivered"
        default:           return "Preparing"
        }
    }

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DefaultLiveActivityAttributes.self) { context in
            let orderNumber = context.attributes.data["orderNumber"]?.asString() ?? "Order"
            let status = context.state.data["status"]?.asString() ?? "preparing"
            let message = context.state.data["message"]?.asString() ?? "Your order is being prepared"
            let eta = context.state.data["estimatedTime"]?.asString() ?? ""

            VStack(spacing: 10) {
                HStack {
                    Text(orderNumber)
                        .font(.caption)
                        .foregroundColor(.gray)
                    Spacer()
                    if !eta.isEmpty {
                        Text(eta)
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                    }
                }

                HStack(spacing: 12) {
                    Image(systemName: statusIcon(for: status))
                        .font(.title2)
                        .foregroundColor(statusColor(for: status))

                    VStack(alignment: .leading, spacing: 2) {
                        Text(statusLabel(for: status))
                            .font(.headline)
                            .foregroundColor(.white)
                        Text(message)
                            .font(.subheadline)
                            .foregroundColor(.white.opacity(0.8))
                            .lineLimit(1)
                    }
                    Spacer()
                }

                DeliveryProgressBar(status: status)
            }
            .padding()
            .activityBackgroundTint(Color(red: 0.11, green: 0.13, blue: 0.19))
            .activitySystemActionForegroundColor(.white)

        } dynamicIsland: { context in
            let status = context.state.data["status"]?.asString() ?? "preparing"
            let message = context.state.data["message"]?.asString() ?? "Preparing"
            let eta = context.state.data["estimatedTime"]?.asString() ?? ""

            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: statusIcon(for: status))
                        .font(.title2)
                        .foregroundColor(statusColor(for: status))
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(statusLabel(for: status))
                        .font(.headline)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    if !eta.isEmpty {
                        Text(eta)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(message)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            } compactLeading: {
                Image(systemName: statusIcon(for: status))
                    .foregroundColor(statusColor(for: status))
            } compactTrailing: {
                Text(statusLabel(for: status))
                    .font(.caption)
            } minimal: {
                Image(systemName: statusIcon(for: status))
                    .foregroundColor(statusColor(for: status))
            }
        }
    }
}

@available(iOS 16.2, *)
struct DeliveryProgressBar: View {
    let status: String

    private var progress: CGFloat {
        switch status {
        case "on_the_way": return 0.6
        case "delivered":  return 1.0
        default:           return 0.25
        }
    }

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 3)
                    .fill(Color.white.opacity(0.2))
                    .frame(height: 6)
                RoundedRectangle(cornerRadius: 3)
                    .fill(progress >= 1.0 ? Color.green : Color.blue)
                    .frame(width: geo.size.width * progress, height: 6)
            }
        }
        .frame(height: 6)
    }
}

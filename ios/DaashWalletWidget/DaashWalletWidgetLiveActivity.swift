/**
 * Daash Wallet Live Activity Widget
 *
 * This file implements iOS Live Activities and Dynamic Island support for:
 * - Transaction status updates (XLM, USDC, etc.)
 * - On-ramp purchase progress (Ramp Network)
 * - Subscription renewals
 *
 * Requirements:
 * - iOS 16.1+ for Live Activities
 * - iOS 16.2+ for Dynamic Island
 * - iPhone 14 Pro+ for Dynamic Island hardware
 *
 * Setup Instructions:
 * 1. In Xcode: File → New → Target → Widget Extension
 * 2. Name: DaashWalletWidget
 * 3. Include Live Activity: ✓
 * 4. Replace generated code with this file
 * 5. Add to main app target
 */

import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Activity Attributes
struct DaashWalletAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Common properties
        var type: String // "transaction", "onramp", "subscription"
        var status: String // "pending", "confirming", "completed", "failed"
        var progress: Double // 0-100
        var startTime: Date

        // Transaction specific
        var amount: String?
        var asset: String?
        var recipient: String?
        var recipientName: String?
        var txHash: String?

        // On-ramp specific
        var fiatAmount: String?
        var fiatCurrency: String?
        var cryptoAmount: String?
        var cryptoAsset: String?
        var provider: String?

        // Subscription specific
        var tier: String?
        var currency: String?
        var validUntil: String?
    }
}

// MARK: - Live Activity Widget
struct DaashWalletWidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DaashWalletAttributes.self) { context in
            // Lock Screen / Banner UI
            LockScreenView(context: context)
        } dynamicIsland: { context in
            // Dynamic Island UI (iPhone 14 Pro+)
            DynamicIsland {
                // Expanded View
                DynamicIslandExpandedRegion(.leading) {
                    ExpandedLeadingView(context: context)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    ExpandedTrailingView(context: context)
                }
                DynamicIslandExpandedRegion(.center) {
                    ExpandedCenterView(context: context)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ExpandedBottomView(context: context)
                }
            } compactLeading: {
                // Compact Leading (left side of Dynamic Island)
                CompactLeadingView(context: context)
            } compactTrailing: {
                // Compact Trailing (right side)
                CompactTrailingView(context: context)
            } minimal: {
                // Minimal View (when multiple activities)
                MinimalView(context: context)
            }
        }
    }
}

// MARK: - Lock Screen View
struct LockScreenView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: iconName)
                    .font(.title2)
                    .foregroundColor(.blue)

                Text(title)
                    .font(.headline)
                    .fontWeight(.semibold)

                Spacer()

                Text(context.state.status.capitalized)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(statusColor.opacity(0.2))
                    .foregroundColor(statusColor)
                    .cornerRadius(8)
            }

            if context.state.type == "transaction" {
                TransactionLockScreenContent(context: context)
            } else if context.state.type == "onramp" {
                OnRampLockScreenContent(context: context)
            } else if context.state.type == "subscription" {
                SubscriptionLockScreenContent(context: context)
            }

            HStack {
                ProgressView(value: context.state.progress / 100.0)
                    .progressViewStyle(.linear)
                    .tint(statusColor)

                Text("\(Int(context.state.progress))%")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.secondary)
                    .frame(width: 40, alignment: .trailing)
            }
        }
        .padding(16)
        .activityBackgroundTint(Color.black.opacity(0.1))
        .activitySystemActionForegroundColor(Color.white)
    }

    var title: String {
        switch context.state.type {
        case "transaction":
            return "Sending \(context.state.asset ?? "XLM")"
        case "onramp":
            return "Buying Crypto"
        case "subscription":
            return "Pro Subscription"
        default:
            return "Daash Wallet"
        }
    }

    var iconName: String {
        switch context.state.type {
        case "transaction":
            return "arrow.up.circle.fill"
        case "onramp":
            return "cart.fill"
        case "subscription":
            return "star.fill"
        default:
            return "app.fill"
        }
    }

    var statusColor: Color {
        switch context.state.status {
        case "pending":
            return .orange
        case "confirming", "processing":
            return .blue
        case "completed":
            return .green
        case "failed":
            return .red
        default:
            return .gray
        }
    }
}

// MARK: - Transaction Lock Screen Content
struct TransactionLockScreenContent: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Amount:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text("\(context.state.amount ?? "0") \(context.state.asset ?? "XLM")")
                    .font(.body)
                    .fontWeight(.semibold)
            }

            if let recipientName = context.state.recipientName {
                HStack {
                    Text("To:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(recipientName)
                        .font(.body)
                }
            } else if let recipient = context.state.recipient {
                HStack {
                    Text("To:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(formatAddress(recipient))
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            if let txHash = context.state.txHash {
                HStack {
                    Text("Hash:")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                    Text(formatHash(txHash))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }
        }
    }

    func formatAddress(_ address: String) -> String {
        guard address.count > 10 else { return address }
        return "\(address.prefix(6))...\(address.suffix(4))"
    }

    func formatHash(_ hash: String) -> String {
        guard hash.count > 10 else { return hash }
        return "\(hash.prefix(8))..."
    }
}

// MARK: - On-Ramp Lock Screen Content
struct OnRampLockScreenContent: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Paying:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text("\(context.state.fiatCurrency ?? "USD") \(context.state.fiatAmount ?? "0")")
                    .font(.body)
                    .fontWeight(.semibold)
            }

            HStack {
                Text("Getting:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text("~\(context.state.cryptoAmount ?? "0") \(context.state.cryptoAsset ?? "USDC")")
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
            }

            if let provider = context.state.provider {
                Text("via \(provider)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Subscription Lock Screen Content
struct SubscriptionLockScreenContent: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("Plan:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text(context.state.tier?.capitalized ?? "Pro")
                    .font(.body)
                    .fontWeight(.semibold)
            }

            HStack {
                Text("Amount:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Text("\(context.state.currency ?? "USD") \(context.state.amount ?? "29.99")")
                    .font(.body)
                    .fontWeight(.semibold)
            }

            if let validUntil = context.state.validUntil {
                HStack {
                    Text("Valid until:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(validUntil)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

// MARK: - Dynamic Island Views

// Compact Leading (left icon)
struct CompactLeadingView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        Image(systemName: iconName)
            .foregroundColor(.blue)
            .font(.body)
    }

    var iconName: String {
        switch context.state.type {
        case "transaction": return "arrow.up.circle.fill"
        case "onramp": return "cart.fill"
        case "subscription": return "star.fill"
        default: return "app.fill"
        }
    }
}

// Compact Trailing (right text)
struct CompactTrailingView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        Text("\(Int(context.state.progress))%")
            .font(.caption2)
            .fontWeight(.semibold)
            .foregroundColor(.white)
    }
}

// Minimal View
struct MinimalView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        Image(systemName: iconName)
            .foregroundColor(.blue)
    }

    var iconName: String {
        switch context.state.type {
        case "transaction": return "arrow.up.circle.fill"
        case "onramp": return "cart.fill"
        case "subscription": return "star.fill"
        default: return "app.fill"
        }
    }
}

// Expanded Leading
struct ExpandedLeadingView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(alignment: .leading) {
            Image(systemName: iconName)
                .font(.title)
                .foregroundColor(.blue)
        }
    }

    var iconName: String {
        switch context.state.type {
        case "transaction": return "arrow.up.circle.fill"
        case "onramp": return "cart.fill"
        case "subscription": return "star.fill"
        default: return "app.fill"
        }
    }
}

// Expanded Trailing
struct ExpandedTrailingView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Text("\(Int(context.state.progress))%")
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(.white)

            Text(context.state.status.capitalized)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// Expanded Center
struct ExpandedCenterView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.white)

            if context.state.type == "transaction" {
                Text("\(context.state.amount ?? "0") \(context.state.asset ?? "XLM")")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else if context.state.type == "onramp" {
                Text("\(context.state.fiatCurrency ?? "USD") \(context.state.fiatAmount ?? "0")")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    var title: String {
        switch context.state.type {
        case "transaction": return "Sending"
        case "onramp": return "Buying"
        case "subscription": return "Renewing"
        default: return "Processing"
        }
    }
}

// Expanded Bottom
struct ExpandedBottomView: View {
    let context: ActivityViewContext<DaashWalletAttributes>

    var body: some View {
        VStack(spacing: 8) {
            ProgressView(value: context.state.progress / 100.0)
                .progressViewStyle(.linear)
                .tint(.blue)

            if context.state.type == "transaction", let recipientName = context.state.recipientName {
                Text("To: \(recipientName)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal)
    }
}

// MARK: - Widget Entry
@main
struct DaashWalletWidgetBundle: WidgetBundle {
    var body: some Widget {
        DaashWalletWidgetLiveActivity()
    }
}

// MARK: - SwiftUI Previews
struct DaashWalletWidgetLiveActivity_Previews: PreviewProvider {
    static let attributes = DaashWalletAttributes()

    static let transactionState = DaashWalletAttributes.ContentState(
        type: "transaction",
        status: "confirming",
        progress: 65,
        startTime: Date(),
        amount: "100",
        asset: "USDC",
        recipient: "GXXX...XXXX",
        recipientName: "Sarah",
        txHash: "abc123..."
    )

    static let onrampState = DaashWalletAttributes.ContentState(
        type: "onramp",
        status: "processing",
        progress: 50,
        startTime: Date(),
        fiatAmount: "500",
        fiatCurrency: "USD",
        cryptoAmount: "50",
        cryptoAsset: "USDC",
        provider: "Ramp Network"
    )

    static var previews: some View {
        Group {
            // Transaction previews
            attributes
                .previewContext(transactionState, viewKind: .dynamicIsland(.compact))
                .previewDisplayName("Transaction - Compact")

            attributes
                .previewContext(transactionState, viewKind: .dynamicIsland(.expanded))
                .previewDisplayName("Transaction - Expanded")

            attributes
                .previewContext(transactionState, viewKind: .content)
                .previewDisplayName("Transaction - Lock Screen")

            // On-ramp previews
            attributes
                .previewContext(onrampState, viewKind: .dynamicIsland(.compact))
                .previewDisplayName("On-Ramp - Compact")

            attributes
                .previewContext(onrampState, viewKind: .dynamicIsland(.expanded))
                .previewDisplayName("On-Ramp - Expanded")

            attributes
                .previewContext(onrampState, viewKind: .content)
                .previewDisplayName("On-Ramp - Lock Screen")
        }
    }
}

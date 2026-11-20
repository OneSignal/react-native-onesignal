// swift-tools-version: 6.0

import Foundation
import PackageDescription

func oneSignalEnvFlag(_ name: String) -> Bool {
    let value = Context.environment[name]?.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    return value == "true" || value == "1"
}

let oneSignalDisableLocation = oneSignalEnvFlag("ONESIGNAL_DISABLE_LOCATION")

// Keep in sync with onesignal_xcframework_version in react-native-onesignal.podspec.
let oneSignalXCFrameworkVersion: Version = "5.8.1"

// InAppMessages and Location are separate library products in OneSignal-XCFramework
// and must be linked explicitly under SPM.
var oneSignalDependencies: [Target.Dependency] = [
    .product(name: "OneSignalFramework", package: "OneSignal-XCFramework"),
    .product(name: "OneSignalInAppMessages", package: "OneSignal-XCFramework"),
]

if !oneSignalDisableLocation {
    oneSignalDependencies.append(.product(name: "OneSignalLocation", package: "OneSignal-XCFramework"))
}

let package = Package(
    name: "ReactNativeOneSignal",
    platforms: [.iOS("15.1")],
    products: [
        .library(name: "ReactNativeOneSignal", targets: ["ReactNativeOneSignal"]),
    ],
    dependencies: [
        // Local packages generated per app by React Native's SwiftPM autolinker,
        // relative to where it places this package.
        .package(name: "ReactNative", path: "../../../../xcframeworks"),
        .package(name: "React-GeneratedCode", path: "../../../ios"),
        .package(url: "https://github.com/OneSignal/OneSignal-XCFramework", exact: oneSignalXCFrameworkVersion),
    ],
    targets: [
        .target(
            name: "ReactNativeOneSignal",
            dependencies: [
                .product(name: "ReactHeaders", package: "ReactNative"),
                .product(name: "ReactNativeHeaders", package: "ReactNative"),
                .product(name: "ReactNativeDependenciesHeaders", package: "ReactNative"),
                .product(name: "ReactAppHeaders", package: "React-GeneratedCode"),
            ] + oneSignalDependencies,
            path: "ios/RCTOneSignal",
            publicHeadersPath: ".",
            cSettings: [.define("RCT_NEW_ARCH_ENABLED", to: "1")],
            cxxSettings: [
                .define("RCT_NEW_ARCH_ENABLED", to: "1"),
                .define("DEBUG", .when(configuration: .debug)),
                .define("NDEBUG", .when(configuration: .release)),
            ]
        ),
    ],
    cxxLanguageStandard: .cxx20
)

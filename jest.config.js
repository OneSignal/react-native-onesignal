module.exports = {
    preset: "react-native",
    moduleDirectories: ["node_modules","src"],
    modulePathIgnorePatterns: ["examples", "dist"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*"],
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
}


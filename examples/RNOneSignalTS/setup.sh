#!/bin/bash

# OneSignal React Native TypeScript Example Setup Script

echo "🚀 Setting up OneSignal React Native TypeScript Example..."

# Check if Node.js is installed
if ! command -v node &>/dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (>= 20) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# iOS setup
if [ -d "ios" ]; then
    echo "🍎 Setting up iOS..."
    cd ios
    if command -v pod &>/dev/null; then
        pod install
        if [ $? -eq 0 ]; then
            echo "✅ iOS setup completed"
        else
            echo "⚠️  iOS pod install failed, but continuing..."
        fi
    else
        echo "⚠️  CocoaPods not found. Please install CocoaPods for iOS development."
    fi
    cd ..
fi

# Check if OneSignal App ID is configured
if grep -q "YOUR_ONESIGNAL_APP_ID" App.tsx; then
    echo "⚠️  Please replace 'YOUR_ONESIGNAL_APP_ID' in App.tsx with your actual OneSignal App ID"
    echo "   You can find your App ID in the OneSignal dashboard under Settings > Keys & IDs"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Replace 'YOUR_ONESIGNAL_APP_ID' in App.tsx with your actual OneSignal App ID"
echo "2. Start Metro bundler: npm start"
echo "3. Run on iOS: npm run ios"
echo "4. Run on Android: npm run android"
echo ""
echo "For more information, see README.md"

ORIGINAL_DIR=$(pwd)

# Build root package
cd ../../
bun run build

rm react-native-onesignal.tgz
bun pm pack
mv react-native-onesignal-*.tgz react-native-onesignal.tgz

# Use fresh install of the package
cd $ORIGINAL_DIR
rm -rf node_modules/react-native-onesignal
bun i

# Reinstall pods to pick up the updated native module
if [ -d "ios" ]; then
  cd ios
  pod install
  cd ..
fi

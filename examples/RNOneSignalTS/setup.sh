ORIGINAL_DIR=$(pwd)

# Build root package
cd ../../
bun run build

rm -f react-native-onesignal.tgz
bun pm pack
mv react-native-onesignal-*.tgz react-native-onesignal.tgz

# Use fresh install of the package
cd "$ORIGINAL_DIR"
bun pm cache rm
bun i

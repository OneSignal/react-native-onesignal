cd ../../
bun run build

rm react-native-onesignal.tgz
bun pm pack
mv react-native-onesignal-*.tgz react-native-onesignal.tgz

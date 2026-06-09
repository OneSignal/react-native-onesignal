require 'json'
package_json = JSON.parse(File.read('package.json'))
onesignal_xcframework_version = '5.5.2'
onesignal_disable_location = ENV['ONESIGNAL_DISABLE_LOCATION'] == 'true'

Pod::Spec.new do |s|
  s.name           = "react-native-onesignal"
  s.version        = package_json["version"]
  s.summary        = package_json["description"]
  s.homepage       = "https://github.com/OneSignal/react-native-onesignal"
  s.license        = package_json["license"]
  s.author         = { package_json["author"] => package_json["author"] }
  s.platform       = :ios, "15.1"
  s.source         = { :git => "#{package_json["repository"]["url"]}.git", :tag => "#{s.version}" }
  s.source_files   = 'ios/RCTOneSignal/*.{h,m,mm}'
  s.static_framework = true

  install_modules_dependencies(s)

  if onesignal_disable_location
    s.dependency 'OneSignalXCFramework/OneSignal', onesignal_xcframework_version
    s.dependency 'OneSignalXCFramework/OneSignalInAppMessages', onesignal_xcframework_version
  else
    s.dependency 'OneSignalXCFramework', onesignal_xcframework_version
  end
end

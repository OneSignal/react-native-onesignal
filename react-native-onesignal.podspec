require 'json'
package_json = JSON.parse(File.read('package.json'))

Pod::Spec.new do |s|
  s.name           = "react-native-onesignal"
  s.version        = package_json["version"]
  s.summary        = package_json["description"]
  s.homepage       = "https://github.com/OneSignal/react-native-onesignal"
  s.license        = package_json["license"]
  s.author         = { package_json["author"] => package_json["author"] }
  s.platform       = :ios, "11.0"
  s.source         = { :git => "#{package_json["repository"]["url"]}.git", :tag => "#{s.version}" }
  s.source_files   = 'ios/RCTOneSignal/*.{h,m,mm}'
  s.static_framework = true

  install_modules_dependencies(s)

  s.dependency 'OneSignalXCFramework', '5.5.0'
end

//
//  RNOneSignalWidgetBundle.swift
//  RNOneSignalWidget
//
//  Created by Brian Smith on 4/26/24.
//

import WidgetKit
import SwiftUI

#if !targetEnvironment(macCatalyst)
@main
struct RNOneSignalWidgetBundle: WidgetBundle {
    var body: some Widget {
        RNOneSignalWidgetLiveActivity()
    }
}
#endif

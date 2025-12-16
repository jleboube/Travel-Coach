//
//  CoachHubApp.swift
//  CoachHub
//
//  Main app entry point
//

import SwiftUI

@main
struct CoachHubApp: App {
    @StateObject private var authService = AuthService.shared

    var body: some Scene {
        WindowGroup {
            if authService.isAuthenticated {
                MainTabView()
            } else {
                LoginView()
            }
        }
    }
}

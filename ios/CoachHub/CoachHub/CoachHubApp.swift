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
    @AppStorage("hasCompletedProfileSetup") private var hasCompletedProfileSetup = false

    var body: some Scene {
        WindowGroup {
            if authService.isAuthenticated {
                // Wait for user data to load before deciding what to show
                if authService.currentUser == nil {
                    // Show loading while fetching user data
                    LoadingView()
                } else if !hasCompletedProfileSetup && needsProfileSetup {
                    // Check if user needs to complete profile setup (name missing from Apple Sign In)
                    SetupProfileView {
                        hasCompletedProfileSetup = true
                    }
                } else if userHasTeam {
                    // User has a team - show main app
                    MainTabView()
                } else {
                    // User doesn't have a team - show onboarding to create/join
                    OnboardingView()
                }
            } else {
                LoginView()
            }
        }
    }

    /// Check if the user needs to complete their profile
    /// (Apple didn't provide their name, so they need to enter it manually)
    private var needsProfileSetup: Bool {
        guard let user = authService.currentUser else {
            return false
        }
        // User needs setup if their name is nil or empty
        return user.name == nil || user.name?.isEmpty == true
    }

    /// Check if the user has a team from the backend
    /// This is the source of truth - not a local flag
    private var userHasTeam: Bool {
        authService.currentUser?.team != nil
    }
}

// MARK: - Loading View

struct LoadingView: View {
    var body: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)

            Text("Loading...")
                .font(.headline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
    }
}

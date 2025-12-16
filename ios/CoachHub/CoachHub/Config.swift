//
//  Config.swift
//  CoachHub
//
//  Configuration file for API endpoints and app settings
//

import Foundation

struct Config {
    // MARK: - API Configuration

    #if DEBUG
    static let apiBaseURL = "https://coach.z-q.me/api"
    #else
    static let apiBaseURL = "https://coach.z-q.me/api"
    #endif

    // MARK: - Auth Configuration

    static let authTokenKey = "coach_hub_auth_token"
    static let userIdKey = "coach_hub_user_id"
    static let userEmailKey = "coach_hub_user_email"
    static let userNameKey = "coach_hub_user_name"
    static let userRoleKey = "coach_hub_user_role"

    // MARK: - App Configuration

    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    static let appBuild = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"

    // MARK: - Network Configuration

    static let requestTimeout: TimeInterval = 30.0
    static let resourceTimeout: TimeInterval = 60.0
}

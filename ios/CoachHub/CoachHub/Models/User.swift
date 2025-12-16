//
//  User.swift
//  CoachHub
//
//  User model matching backend schema
//

import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: UserRole
    let image: String?
    let emailVerified: Date?
    let createdAt: Date
    let updatedAt: Date

    var displayName: String {
        name ?? email
    }

    var initials: String {
        if let name = name {
            let components = name.components(separatedBy: " ")
            let initials = components.compactMap { $0.first }.prefix(2)
            return String(initials).uppercased()
        }
        return String(email.prefix(2)).uppercased()
    }
}

enum UserRole: String, Codable {
    case HEAD_COACH
    case ASSISTANT_COACH
    case TEAM_MANAGER
    case PARENT
    case PLAYER

    var displayName: String {
        switch self {
        case .HEAD_COACH:
            return "Head Coach"
        case .ASSISTANT_COACH:
            return "Assistant Coach"
        case .TEAM_MANAGER:
            return "Team Manager"
        case .PARENT:
            return "Parent"
        case .PLAYER:
            return "Player"
        }
    }
}

// MARK: - Auth Response Models

struct AuthResponse: Codable {
    let user: User
    let token: String
}

struct AppleAuthRequest: Codable {
    let identityToken: String
    let authorizationCode: String
    let fullName: PersonNameComponents?
    let email: String?
}

struct AppleAuthResponse: Codable {
    let user: User
    let token: String
    let isNewUser: Bool
}

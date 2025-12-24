//
//  User.swift
//  CoachHub
//
//  User model matching backend schema
//

import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String?
    let name: String?
    let role: UserRole
    let image: String?
    let emailVerified: Date?
    let createdAt: Date
    let updatedAt: Date
    let team: Team?

    enum CodingKeys: String, CodingKey {
        case id, email, name, role, image, emailVerified, createdAt, updatedAt, team
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        email = try container.decodeIfPresent(String.self, forKey: .email)
        name = try container.decodeIfPresent(String.self, forKey: .name)
        role = try container.decode(UserRole.self, forKey: .role)
        image = try container.decodeIfPresent(String.self, forKey: .image)
        emailVerified = try container.decodeIfPresent(Date.self, forKey: .emailVerified)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        updatedAt = try container.decode(Date.self, forKey: .updatedAt)
        // Team is optional and may not be present in all API responses
        team = try container.decodeIfPresent(Team.self, forKey: .team)
    }

    var displayName: String {
        // If name exists and is not empty, use it
        if let name = name, !name.isEmpty {
            return name
        }
        // Otherwise try email, but format it nicely if it's an Apple private relay email
        if let email = email {
            if email.contains("@privaterelay.appleid.com") {
                return "Coach"  // Friendly fallback for Apple private relay users
            }
            // Use the part before @ as display name
            return email.components(separatedBy: "@").first ?? email
        }
        return "Unknown User"
    }

    var initials: String {
        if let name = name, !name.isEmpty {
            let components = name.components(separatedBy: " ")
            let initials = components.compactMap { $0.first }.prefix(2)
            return String(initials).uppercased()
        }
        if let email = email {
            if email.contains("@privaterelay.appleid.com") {
                return "CH"  // CoachHub initials for Apple private relay users
            }
            return String(email.prefix(2)).uppercased()
        }
        return "??"
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

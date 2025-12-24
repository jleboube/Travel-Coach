//
//  Team.swift
//  CoachHub
//
//  Team model for multi-team support
//

import Foundation

struct Team: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let season: String
    let joinCode: String
    let logoUrl: String?
    let colors: [String]
    let ageGroup: String?
    let active: Bool
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, season, logoUrl, colors, ageGroup, active, createdAt, updatedAt
        case joinCode = "joinCode"
    }
}

struct TeamMember: Codable, Identifiable {
    let id: String
    let teamId: String
    let userId: String
    let role: String
    let createdAt: Date
    let updatedAt: Date
}

// Request/Response models for team operations
struct CreateTeamRequest: Codable {
    let name: String
    let season: String
    let logoUrl: String?
    let colors: [String]?
    let ageGroup: String?
}

struct CreateTeamResponse: Codable {
    let team: Team
}

struct JoinTeamRequest: Codable {
    let joinCode: String
}

struct JoinTeamResponse: Codable {
    let team: Team
}

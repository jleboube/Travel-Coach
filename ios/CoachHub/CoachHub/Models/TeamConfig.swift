//
//  TeamConfig.swift
//  CoachHub
//

import Foundation

struct TeamConfig: Codable, Identifiable {
    let id: String
    let teamName: String
    let season: String
    let logoUrl: String?
    let colors: [String]
    let ageGroup: String?
    let createdAt: Date
    let updatedAt: Date
}

struct Invitation: Codable, Identifiable {
    let id: String
    let email: String
    let role: UserRole
    let token: String
    let status: InvitationStatus
    let expiresAt: Date
    let invitedBy: String
    let createdAt: Date
    let updatedAt: Date

    var isExpired: Bool {
        Date() > expiresAt
    }
}

enum InvitationStatus: String, Codable {
    case PENDING
    case ACCEPTED
    case EXPIRED
    case CANCELLED
}

struct Message: Codable, Identifiable {
    let id: String
    let subject: String
    let body: String
    let senderId: String
    let recipients: [String]
    let sentAt: Date
}

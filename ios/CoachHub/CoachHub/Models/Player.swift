//
//  Player.swift
//  CoachHub
//

import Foundation

struct Player: Codable, Identifiable {
    let id: String
    let firstName: String
    let lastName: String
    let jerseyNumber: Int
    let photo: String?
    let positions: [String]
    let bats: String
    let `throws`: String
    let graduationYear: Int
    let birthDate: Date?
    let parentName: String?
    let parentPhone: String?
    let parentEmail: String?
    let active: Bool
    let createdAt: Date
    let updatedAt: Date

    var fullName: String {
        "\(firstName) \(lastName)"
    }

    var displayName: String {
        "#\(jerseyNumber) \(fullName)"
    }

    var age: Int? {
        guard let birthDate = birthDate else { return nil }
        let calendar = Calendar.current
        let ageComponents = calendar.dateComponents([.year], from: birthDate, to: Date())
        return ageComponents.year
    }

    var positionsDisplay: String {
        positions.joined(separator: ", ")
    }
}

struct CreatePlayerRequest: Codable {
    let firstName: String
    let lastName: String
    let jerseyNumber: Int
    let photo: String?
    let positions: [String]
    let bats: String
    let `throws`: String
    let graduationYear: Int
    let birthDate: Date?
    let parentName: String?
    let parentPhone: String?
    let parentEmail: String?
}

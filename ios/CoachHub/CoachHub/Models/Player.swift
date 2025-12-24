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
    let performanceMetrics: [PerformanceMetric]?
    let latestPerformanceMetrics: LatestPerformanceMetrics?

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

    var birthYear: Int? {
        guard let birthDate = birthDate else { return nil }
        return Calendar.current.component(.year, from: birthDate)
    }

    var positionsDisplay: String {
        positions.joined(separator: ", ")
    }

    // Computed properties for latest metrics
    var latestExitVelocity: Double? {
        latestPerformanceMetrics?.exitVelocity?.value
    }

    var latestPulldownVelocity: Double? {
        latestPerformanceMetrics?.pulldownVelocity?.value
    }

    var latestSixtyYardSprint: Double? {
        latestPerformanceMetrics?.sixtyYardSprint?.value
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
    let birthDate: String?  // ISO8601 date string
    let parentName: String?
    let parentPhone: String?
    let parentEmail: String?
    let active: Bool

    init(
        firstName: String,
        lastName: String,
        jerseyNumber: Int,
        photo: String?,
        positions: [String],
        bats: String,
        throws: String,
        graduationYear: Int,
        birthDate: Date?,
        parentName: String?,
        parentPhone: String?,
        parentEmail: String?,
        active: Bool = true
    ) {
        self.firstName = firstName
        self.lastName = lastName
        self.jerseyNumber = jerseyNumber
        self.photo = photo
        self.positions = positions
        self.bats = bats
        self.throws = `throws`
        self.graduationYear = graduationYear
        // Convert Date to ISO8601 string for backend
        if let date = birthDate {
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime]
            self.birthDate = formatter.string(from: date)
        } else {
            self.birthDate = nil
        }
        self.parentName = parentName
        self.parentPhone = parentPhone
        self.parentEmail = parentEmail
        self.active = active
    }
}

// MARK: - Performance Metrics

enum PerformanceType: String, Codable {
    case exitVelocity = "EXIT_VELOCITY"
    case pulldownVelocity = "PULLDOWN_VELOCITY"
    case sixtyYardSprint = "SIXTY_YARD_SPRINT"

    var displayName: String {
        switch self {
        case .exitVelocity:
            return "Exit Velocity"
        case .pulldownVelocity:
            return "Pulldown Velocity"
        case .sixtyYardSprint:
            return "60 Yard Sprint"
        }
    }

    var unit: String {
        switch self {
        case .exitVelocity, .pulldownVelocity:
            return "mph"
        case .sixtyYardSprint:
            return "sec"
        }
    }
}

struct PerformanceMetric: Codable, Identifiable {
    let id: String
    let playerId: String
    let type: PerformanceType
    let value: Double
    let unit: String
    let date: Date
    let notes: String?
    let createdAt: Date
}

struct LatestPerformanceMetrics: Codable {
    let exitVelocity: PerformanceMetric?
    let pulldownVelocity: PerformanceMetric?
    let sixtyYardSprint: PerformanceMetric?

    enum CodingKeys: String, CodingKey {
        case exitVelocity = "EXIT_VELOCITY"
        case pulldownVelocity = "PULLDOWN_VELOCITY"
        case sixtyYardSprint = "SIXTY_YARD_SPRINT"
    }
}

struct CreatePerformanceMetricRequest: Codable {
    let type: String
    let value: Double
    let unit: String?
    let date: Date?
    let notes: String?
}

struct PerformanceMetricsResponse: Codable {
    let history: [PerformanceMetric]
    let latest: LatestPerformanceMetrics
}

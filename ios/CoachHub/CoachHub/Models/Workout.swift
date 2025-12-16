//
//  Workout.swift
//  CoachHub
//

import Foundation

struct Workout: Codable, Identifiable {
    let id: String
    let title: String
    let frequency: WorkoutFrequency
    let ageMin: Int?
    let ageMax: Int?
    let duration: Int
    let programDuration: Int?
    let programDurationUnit: String?
    let focus: [WorkoutFocus]
    let description: String?
    let active: Bool
    let createdAt: Date
    let updatedAt: Date

    var ageRangeDisplay: String {
        if let min = ageMin, let max = ageMax {
            return "Ages \(min)-\(max)"
        } else if let min = ageMin {
            return "Ages \(min)+"
        } else if let max = ageMax {
            return "Ages up to \(max)"
        }
        return "All ages"
    }

    var focusDisplay: String {
        focus.map { $0.displayName }.joined(separator: ", ")
    }

    var durationDisplay: String {
        "\(duration) minutes"
    }
}

enum WorkoutFrequency: String, Codable {
    case DAILY
    case EVERY_OTHER_DAY
    case TWICE_WEEKLY
    case WEEKLY
    case BIWEEKLY
    case MONTHLY
    case CUSTOM

    var displayName: String {
        switch self {
        case .DAILY: return "Daily"
        case .EVERY_OTHER_DAY: return "Every Other Day"
        case .TWICE_WEEKLY: return "Twice Weekly"
        case .WEEKLY: return "Weekly"
        case .BIWEEKLY: return "Biweekly"
        case .MONTHLY: return "Monthly"
        case .CUSTOM: return "Custom"
        }
    }
}

enum WorkoutFocus: String, Codable {
    case HITTING
    case PITCHING
    case FIELDING
    case BASE_RUNNING
    case CONDITIONING
    case STRENGTH
    case AGILITY
    case MENTAL
    case TEAM_BUILDING

    var displayName: String {
        rawValue.replacingOccurrences(of: "_", with: " ").capitalized
    }

    var icon: String {
        switch self {
        case .HITTING: return "baseball.fill"
        case .PITCHING: return "figure.baseball"
        case .FIELDING: return "figure.run"
        case .BASE_RUNNING: return "figure.run"
        case .CONDITIONING: return "figure.strengthtraining.traditional"
        case .STRENGTH: return "dumbbell.fill"
        case .AGILITY: return "figure.flexibility"
        case .MENTAL: return "brain.head.profile"
        case .TEAM_BUILDING: return "person.3.fill"
        }
    }
}

struct WorkoutSession: Codable, Identifiable {
    let id: String
    let workoutId: String
    let date: Date
    let notes: String?
    let completed: Bool
    let createdAt: Date
    let updatedAt: Date
}

struct CreateWorkoutRequest: Codable {
    let title: String
    let frequency: WorkoutFrequency
    let ageMin: Int?
    let ageMax: Int?
    let duration: Int
    let programDuration: Int?
    let programDurationUnit: String?
    let focus: [WorkoutFocus]
    let description: String?
}

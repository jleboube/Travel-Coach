//
//  Event.swift
//  CoachHub
//

import Foundation

struct Event: Codable, Identifiable {
    let id: String
    let title: String
    let type: EventType
    let start: Date
    let end: Date
    let allDay: Bool
    let location: String?
    let locationUrl: String?
    let description: String?
    let color: String?
    let recurring: Bool
    let rrule: String?
    let opponent: String?
    let governingBody: GoverningBody?
    let requiresTravel: Bool
    let createdAt: Date
    let updatedAt: Date
    let tournamentId: String?
    let rsvps: [RSVP]?

    var displayTime: String {
        let formatter = DateFormatter()
        if allDay {
            formatter.dateStyle = .medium
            return formatter.string(from: start)
        } else {
            formatter.timeStyle = .short
            return formatter.string(from: start)
        }
    }

    var eventTypeDisplay: String {
        type.displayName
    }
}

enum EventType: String, Codable {
    case PRACTICE
    case GAME
    case TOURNAMENT
    case TEAM_MEETING
    case FUNDRAISER
    case OFF_DAY
    case INDIVIDUAL_LESSON

    var displayName: String {
        switch self {
        case .PRACTICE: return "Practice"
        case .GAME: return "Game"
        case .TOURNAMENT: return "Tournament"
        case .TEAM_MEETING: return "Team Meeting"
        case .FUNDRAISER: return "Fundraiser"
        case .OFF_DAY: return "Off Day"
        case .INDIVIDUAL_LESSON: return "Individual Lesson"
        }
    }

    var icon: String {
        switch self {
        case .PRACTICE: return "figure.baseball"
        case .GAME: return "sportscourt"
        case .TOURNAMENT: return "trophy"
        case .TEAM_MEETING: return "person.3"
        case .FUNDRAISER: return "dollarsign.circle"
        case .OFF_DAY: return "house"
        case .INDIVIDUAL_LESSON: return "person.crop.circle.badge.checkmark"
        }
    }
}

enum GoverningBody: String, Codable {
    case NA
    case PBR
    case USSSA
    case JP_SPORTS
    case PG
    case GAMEDAY
}

struct RSVP: Codable, Identifiable {
    let id: String
    let eventId: String
    let playerName: String
    let status: RSVPStatus
    let createdAt: Date
}

enum RSVPStatus: String, Codable {
    case YES
    case NO
    case MAYBE
}

struct CreateEventRequest: Codable {
    let title: String
    let type: EventType
    let start: Date
    let end: Date
    let allDay: Bool
    let location: String?
    let locationUrl: String?
    let description: String?
    let opponent: String?
    let governingBody: GoverningBody?
    let requiresTravel: Bool
}

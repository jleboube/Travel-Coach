//
//  Announcement.swift
//  CoachHub
//

import Foundation

struct Announcement: Codable, Identifiable {
    let id: String
    let title: String
    let content: String
    let priority: Priority
    let authorId: String
    let createdAt: Date
    let updatedAt: Date

    var timeAgo: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: createdAt, relativeTo: Date())
    }
}

enum Priority: String, Codable {
    case LOW
    case NORMAL
    case HIGH
    case URGENT

    var color: String {
        switch self {
        case .LOW: return "gray"
        case .NORMAL: return "blue"
        case .HIGH: return "orange"
        case .URGENT: return "red"
        }
    }

    var icon: String {
        switch self {
        case .LOW: return "info.circle"
        case .NORMAL: return "bell"
        case .HIGH: return "exclamationmark.circle"
        case .URGENT: return "exclamationmark.triangle.fill"
        }
    }
}

struct CreateAnnouncementRequest: Codable {
    let title: String
    let content: String
    let priority: Priority
}

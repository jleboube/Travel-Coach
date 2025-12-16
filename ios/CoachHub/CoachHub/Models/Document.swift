//
//  Document.swift
//  CoachHub
//

import Foundation

struct Document: Codable, Identifiable {
    let id: String
    let name: String
    let type: DocumentType
    let fileUrl: String
    let fileSize: Int
    let mimeType: String
    let uploadedBy: String?
    let playerId: String?
    let description: String?
    let encrypted: Bool
    let createdAt: Date
    let updatedAt: Date

    var fileSizeDisplay: String {
        ByteCountFormatter.string(fromByteCount: Int64(fileSize), countStyle: .file)
    }

    var fileExtension: String {
        (name as NSString).pathExtension.uppercased()
    }
}

enum DocumentType: String, Codable {
    case INSURANCE
    case BIRTH_CERTIFICATE
    case MEDICAL_FORM
    case ROSTER
    case OTHER

    var displayName: String {
        switch self {
        case .INSURANCE: return "Insurance"
        case .BIRTH_CERTIFICATE: return "Birth Certificate"
        case .MEDICAL_FORM: return "Medical Form"
        case .ROSTER: return "Roster"
        case .OTHER: return "Other"
        }
    }

    var icon: String {
        switch self {
        case .INSURANCE: return "cross.case"
        case .BIRTH_CERTIFICATE: return "doc.text"
        case .MEDICAL_FORM: return "cross.circle"
        case .ROSTER: return "list.bullet.clipboard"
        case .OTHER: return "doc"
        }
    }
}

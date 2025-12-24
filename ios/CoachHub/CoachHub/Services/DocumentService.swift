//
//  DocumentService.swift
//  CoachHub
//
//  Document upload and parsing service
//

import Foundation
import UIKit

class DocumentService {
    private let client = APIClient.shared

    // MARK: - Fetch Documents

    func fetchDocuments() async throws -> [Document] {
        try await client.get("/documents")
    }

    func fetchDocument(id: String) async throws -> Document {
        try await client.get("/documents/\(id)")
    }

    // MARK: - Upload Document

    func uploadDocument(
        fileData: Data,
        filename: String,
        mimeType: String,
        name: String,
        type: DocumentType,
        description: String? = nil,
        playerId: String? = nil
    ) async throws -> Document {
        AppLogger.network("Uploading document: \(filename), Size: \(fileData.count) bytes, Type: \(type.rawValue)")

        // Create multipart form data
        let boundary = "Boundary-\(UUID().uuidString)"
        var body = Data()

        // Add file field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n".data(using: .utf8)!)

        // Add name field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"name\"\r\n\r\n".data(using: .utf8)!)
        body.append(name.data(using: .utf8)!)
        body.append("\r\n".data(using: .utf8)!)

        // Add type field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"type\"\r\n\r\n".data(using: .utf8)!)
        body.append(type.rawValue.data(using: .utf8)!)
        body.append("\r\n".data(using: .utf8)!)

        // Add description field (optional)
        if let description = description {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"description\"\r\n\r\n".data(using: .utf8)!)
            body.append(description.data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
        }

        // Add playerId field (optional)
        if let playerId = playerId {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"playerId\"\r\n\r\n".data(using: .utf8)!)
            body.append(playerId.data(using: .utf8)!)
            body.append("\r\n".data(using: .utf8)!)
        }

        // End boundary
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        // Create request
        guard let token = KeychainManager.shared.getAuthToken() else {
            throw DocumentError.notAuthenticated
        }

        let url = URL(string: "\(Config.apiBaseURL)/documents")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = body

        AppLogger.network("Sending upload request to: \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            AppLogger.error("Invalid response type", category: .network)
            throw DocumentError.invalidResponse
        }

        AppLogger.network("Response status: \(httpResponse.statusCode)")

        guard httpResponse.statusCode == 201 else {
            AppLogger.error("Upload failed with status \(httpResponse.statusCode)", category: .network)
            throw DocumentError.uploadFailed
        }

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

            if let date = formatter.date(from: dateString) {
                return date
            }

            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date from: \(dateString)"
            )
        }

        let document = try decoder.decode(Document.self, from: data)
        AppLogger.network("Document uploaded successfully: \(document.id)")

        return document
    }

    // MARK: - Parse Document

    enum ParseDataType: String {
        case schedule
        case roster
        case travel
        case workouts
    }

    func parseDocument(
        fileData: Data,
        filename: String,
        mimeType: String,
        dataType: ParseDataType
    ) async throws -> ParsedDocumentResult {
        AppLogger.network("Parsing document: \(filename), Data type: \(dataType.rawValue)")

        // Create multipart form data
        let boundary = "Boundary-\(UUID().uuidString)"
        var body = Data()

        // Add file field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(fileData)
        body.append("\r\n".data(using: .utf8)!)

        // Add dataType field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"dataType\"\r\n\r\n".data(using: .utf8)!)
        body.append(dataType.rawValue.data(using: .utf8)!)
        body.append("\r\n".data(using: .utf8)!)

        // End boundary
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        // Create request
        guard let token = KeychainManager.shared.getAuthToken() else {
            throw DocumentError.notAuthenticated
        }

        let url = URL(string: "\(Config.apiBaseURL)/parse-document")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = body
        request.timeoutInterval = 60 // Longer timeout for AI processing

        AppLogger.network("Sending parse request to: \(url.absoluteString)")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            AppLogger.error("Invalid response type", category: .network)
            throw DocumentError.invalidResponse
        }

        AppLogger.network("Parse response status: \(httpResponse.statusCode)")

        guard httpResponse.statusCode == 200 else {
            AppLogger.error("Parsing failed with status \(httpResponse.statusCode)", category: .network)
            throw DocumentError.parsingFailed
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        let result = try decoder.decode(ParsedDocumentResult.self, from: data)
        AppLogger.network("Document parsed successfully: \(result.data.count) records")

        return result
    }

    // MARK: - Delete Document

    func deleteDocument(id: String) async throws {
        try await client.delete("/documents/\(id)")
    }
}

// MARK: - Supporting Types

struct ParsedDocumentResult: Codable {
    let dataType: String
    let data: [AnyCodable]
}

// Helper to decode any JSON
struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) {
        self.value = value
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let bool = try? container.decode(Bool.self) {
            value = bool
        } else if let int = try? container.decode(Int.self) {
            value = int
        } else if let double = try? container.decode(Double.self) {
            value = double
        } else if let string = try? container.decode(String.self) {
            value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            value = array.map { $0.value }
        } else if let dictionary = try? container.decode([String: AnyCodable].self) {
            value = dictionary.mapValues { $0.value }
        } else {
            value = NSNull()
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()

        switch value {
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dictionary as [String: Any]:
            try container.encode(dictionary.mapValues { AnyCodable($0) })
        default:
            try container.encodeNil()
        }
    }
}

// MARK: - Errors

enum DocumentError: LocalizedError {
    case notAuthenticated
    case invalidResponse
    case uploadFailed
    case parsingFailed

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Not authenticated"
        case .invalidResponse:
            return "Invalid server response"
        case .uploadFailed:
            return "Failed to upload document"
        case .parsingFailed:
            return "Failed to parse document"
        }
    }
}

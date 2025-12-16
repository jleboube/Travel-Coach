//
//  EventService.swift
//  CoachHub
//

import Foundation

class EventService {
    private let client = APIClient.shared

    func fetchEvents() async throws -> [Event] {
        try await client.get("/events")
    }

    func fetchEvent(id: String) async throws -> Event {
        try await client.get("/events/\(id)")
    }

    func createEvent(_ request: CreateEventRequest) async throws -> Event {
        try await client.post("/events", body: request)
    }

    func updateEvent(id: String, _ request: CreateEventRequest) async throws -> Event {
        try await client.patch("/events/\(id)", body: request)
    }

    func deleteEvent(id: String) async throws {
        try await client.delete("/events/\(id)")
    }

    func createRSVP(eventId: String, playerName: String, status: RSVPStatus) async throws -> RSVP {
        let body = ["playerName": playerName, "status": status.rawValue]
        return try await client.post("/events/\(eventId)/rsvps", body: body)
    }
}

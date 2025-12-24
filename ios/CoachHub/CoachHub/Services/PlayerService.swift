//
//  PlayerService.swift
//  CoachHub
//

import Foundation

class PlayerService {
    private let client = APIClient.shared

    func fetchPlayers() async throws -> [Player] {
        try await client.get("/players")
    }

    func fetchPlayer(id: String) async throws -> Player {
        try await client.get("/players/\(id)")
    }

    func createPlayer(_ request: CreatePlayerRequest) async throws -> Player {
        try await client.post("/players", body: request)
    }

    func updatePlayer(id: String, _ request: CreatePlayerRequest) async throws -> Player {
        try await client.patch("/players/\(id)", body: request)
    }

    func deletePlayer(id: String) async throws {
        try await client.delete("/players/\(id)")
    }

    func fetchPlayerStats(playerId: String, season: String) async throws -> PlayerStat {
        try await client.get("/players/\(playerId)/stats?season=\(season)")
    }

    // MARK: - Performance Metrics

    func fetchPerformanceMetrics(playerId: String, type: String? = nil) async throws -> PerformanceMetricsResponse {
        var endpoint = "/players/\(playerId)/metrics"
        if let type = type {
            endpoint += "?type=\(type)"
        }
        return try await client.get(endpoint)
    }

    func addPerformanceMetric(
        playerId: String,
        type: String,
        value: Double,
        unit: String? = nil,
        date: Date? = nil,
        notes: String? = nil
    ) async throws -> PerformanceMetric {
        let request = CreatePerformanceMetricRequest(
            type: type,
            value: value,
            unit: unit,
            date: date,
            notes: notes
        )
        return try await client.post("/players/\(playerId)/metrics", body: request)
    }
}

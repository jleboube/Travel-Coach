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
}

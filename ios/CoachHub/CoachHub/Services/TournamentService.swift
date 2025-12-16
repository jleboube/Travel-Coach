//
//  TournamentService.swift
//  CoachHub
//

import Foundation

class TournamentService {
    private let client = APIClient.shared

    func fetchTournaments() async throws -> [Tournament] {
        try await client.get("/tournaments")
    }

    func fetchTournament(id: String) async throws -> Tournament {
        try await client.get("/tournaments/\(id)")
    }

    func createTournament(_ request: CreateTournamentRequest) async throws -> Tournament {
        try await client.post("/tournaments", body: request)
    }

    func updateTournament(id: String, _ request: CreateTournamentRequest) async throws -> Tournament {
        try await client.patch("/tournaments/\(id)", body: request)
    }

    func deleteTournament(id: String) async throws {
        try await client.delete("/tournaments/\(id)")
    }

    func fetchCarpools(tournamentId: String) async throws -> [Carpool] {
        try await client.get("/tournaments/\(tournamentId)/carpools")
    }

    func fetchExpenses(tournamentId: String) async throws -> [TournamentExpense] {
        try await client.get("/tournaments/\(tournamentId)/expenses")
    }
}

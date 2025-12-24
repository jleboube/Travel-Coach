//
//  TeamService.swift
//  CoachHub
//
//  Service for team operations
//

import Foundation

class TeamService {
    static let shared = TeamService()
    private let client = APIClient.shared

    private init() {}

    // MARK: - Create Team

    func createTeam(
        name: String,
        season: String,
        logoUrl: String? = nil,
        colors: [String]? = nil,
        ageGroup: String? = nil
    ) async throws -> Team {
        AppLogger.team("Creating team: \(name)")

        let request = CreateTeamRequest(
            name: name,
            season: season,
            logoUrl: logoUrl,
            colors: colors,
            ageGroup: ageGroup
        )

        do {
            let response: CreateTeamResponse = try await client.post("/teams/create", body: request)
            AppLogger.team("Team created successfully: \(response.team.id)")
            return response.team
        } catch {
            AppLogger.error("Failed to create team: \(error.localizedDescription)", category: .team)
            throw error
        }
    }

    // MARK: - Join Team

    func joinTeam(joinCode: String) async throws -> Team {
        AppLogger.team("Joining team with code: \(joinCode)")

        let request = JoinTeamRequest(joinCode: joinCode)

        do {
            let response: JoinTeamResponse = try await client.post("/teams/join", body: request)
            AppLogger.team("Joined team successfully: \(response.team.id)")
            return response.team
        } catch {
            AppLogger.error("Failed to join team: \(error.localizedDescription)", category: .team)
            throw error
        }
    }

    // MARK: - Get User Teams

    func getUserTeams() async throws -> [Team] {
        AppLogger.team("Fetching user teams")

        // This endpoint would need to be implemented on the backend
        // For now, we'll handle it when needed
        // let teams: [Team] = try await client.get("/teams/my-teams")
        // return teams

        // Placeholder
        return []
    }
}

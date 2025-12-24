//
//  DashboardViewModel.swift
//  CoachHub
//

import Foundation

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var upcomingEvents: [Event] = []
    @Published var announcements: [Announcement] = []
    @Published var totalPlayers = 0
    @Published var totalEvents = 0
    @Published var totalTournaments = 0
    @Published var totalWorkouts = 0
    @Published var isLoading = false

    private let eventService = EventService()
    private let playerService = PlayerService()
    private let tournamentService = TournamentService()
    private let workoutService = WorkoutService()

    func loadDashboard() async {
        isLoading = true

        await withTaskGroup(of: Void.self) { group in
            group.addTask { await self.loadUpcomingEvents() }
            group.addTask { await self.loadStats() }
        }

        isLoading = false
    }

    func refresh() async {
        await loadDashboard()
    }

    private func loadUpcomingEvents() async {
        do {
            let events = try await eventService.fetchEvents()
            upcomingEvents = events.filter { $0.start >= Date() }
                .sorted { $0.start < $1.start }
        } catch {
            AppLogger.error("Failed to load events: \(error.localizedDescription)", category: .general)
        }
    }

    private func loadStats() async {
        async let players = try? playerService.fetchPlayers()
        async let events = try? eventService.fetchEvents()
        async let tournaments = try? tournamentService.fetchTournaments()
        async let workouts = try? workoutService.fetchWorkouts()

        let (playerList, eventList, tournamentList, workoutList) =
            await (players, events, tournaments, workouts)

        totalPlayers = playerList?.count ?? 0
        totalEvents = eventList?.count ?? 0

        // Count only upcoming tournaments (where endDate >= now)
        let now = Date()
        totalTournaments = tournamentList?.filter { $0.endDate >= now }.count ?? 0

        totalWorkouts = workoutList?.count ?? 0
    }
}

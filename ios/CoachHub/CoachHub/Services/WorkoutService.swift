//
//  WorkoutService.swift
//  CoachHub
//

import Foundation

class WorkoutService {
    private let client = APIClient.shared

    func fetchWorkouts() async throws -> [Workout] {
        try await client.get("/workouts")
    }

    func fetchWorkout(id: String) async throws -> Workout {
        try await client.get("/workouts/\(id)")
    }

    func createWorkout(_ request: CreateWorkoutRequest) async throws -> Workout {
        try await client.post("/workouts", body: request)
    }

    func updateWorkout(id: String, _ request: CreateWorkoutRequest) async throws -> Workout {
        try await client.patch("/workouts/\(id)", body: request)
    }

    func deleteWorkout(id: String) async throws {
        try await client.delete("/workouts/\(id)")
    }

    func fetchSessions(workoutId: String) async throws -> [WorkoutSession] {
        try await client.get("/workouts/\(workoutId)/sessions")
    }
}

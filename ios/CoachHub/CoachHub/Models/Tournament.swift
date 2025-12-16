//
//  Tournament.swift
//  CoachHub
//

import Foundation

struct Tournament: Codable, Identifiable {
    let id: String
    let name: String
    let startDate: Date
    let endDate: Date
    let location: String?
    let entryFee: Double?
    let hotelName: String?
    let hotelLink: String?
    let hotelDeadline: Date?
    let perDiem: Double?
    let budget: Double?
    let notes: String?
    let itinerary: String?
    let createdAt: Date
    let updatedAt: Date

    var dateRange: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        let start = formatter.string(from: startDate)
        let end = formatter.string(from: endDate)
        return "\(start) - \(end)"
    }

    var daysUntil: Int? {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: Date(), to: startDate)
        return components.day
    }
}

struct Carpool: Codable, Identifiable {
    let id: String
    let tournamentId: String
    let driverName: String
    let driverPhone: String?
    let seatsOffered: Int
    let passengers: [String]

    var availableSeats: Int {
        seatsOffered - passengers.count
    }
}

struct TournamentExpense: Codable, Identifiable {
    let id: String
    let tournamentId: String
    let category: String
    let description: String
    let amount: Double
    let date: Date
}

struct CreateTournamentRequest: Codable {
    let name: String
    let startDate: Date
    let endDate: Date
    let location: String?
    let entryFee: Double?
    let hotelName: String?
    let hotelLink: String?
    let hotelDeadline: Date?
    let perDiem: Double?
    let budget: Double?
    let notes: String?
    let itinerary: String?
}

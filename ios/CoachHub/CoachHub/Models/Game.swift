//
//  Game.swift
//  CoachHub
//

import Foundation

struct Game: Codable, Identifiable {
    let id: String
    let eventId: String?
    let opponent: String
    let homeAway: String
    let score: String?
    let opponentScore: String?
    let result: String?
    let notes: String?
    let date: Date
    let createdAt: Date
    let updatedAt: Date
    let playerStats: [GamePlayerStat]?

    var isHome: Bool {
        homeAway.uppercased() == "HOME"
    }

    var scoreDisplay: String {
        if let score = score, let opScore = opponentScore {
            return "\(score) - \(opScore)"
        }
        return "TBD"
    }

    var resultDisplay: String {
        result?.uppercased() ?? "TBD"
    }
}

struct GamePlayerStat: Codable, Identifiable {
    let id: String
    let gameId: String
    let playerId: String

    // Hitting
    let ab: Int
    let h: Int
    let doubles: Int
    let triples: Int
    let hr: Int
    let rbi: Int
    let bb: Int
    let k: Int

    // Pitching
    let ip: Double
    let pitchingH: Int
    let r: Int
    let er: Int
    let pitchingBB: Int
    let pitchingK: Int

    // Fielding
    let po: Int
    let a: Int
    let e: Int

    var battingAverage: Double {
        guard ab > 0 else { return 0.0 }
        return Double(h) / Double(ab)
    }

    var era: Double {
        guard ip > 0 else { return 0.0 }
        return (Double(er) * 9.0) / ip
    }
}

struct PlayerStat: Codable, Identifiable {
    let id: String
    let playerId: String
    let season: String

    // Hitting
    let ab: Int
    let h: Int
    let doubles: Int
    let triples: Int
    let hr: Int
    let rbi: Int
    let bb: Int
    let k: Int

    // Pitching
    let ip: Double
    let pitchingH: Int
    let r: Int
    let er: Int
    let pitchingBB: Int
    let pitchingK: Int

    // Fielding
    let po: Int
    let a: Int
    let e: Int

    var battingAverage: Double {
        guard ab > 0 else { return 0.0 }
        return Double(h) / Double(ab)
    }

    var era: Double {
        guard ip > 0 else { return 0.0 }
        return (Double(er) * 9.0) / ip
    }
}

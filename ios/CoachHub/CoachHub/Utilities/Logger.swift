//
//  Logger.swift
//  CoachHub
//
//  Centralized logging utility with build configuration support
//

import Foundation
import os.log

/// Centralized logger for CoachHub with debug/release mode support
struct AppLogger {
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.coachhub"

    private static let authLog = OSLog(subsystem: subsystem, category: "Auth")
    private static let networkLog = OSLog(subsystem: subsystem, category: "Network")
    private static let teamLog = OSLog(subsystem: subsystem, category: "Team")
    private static let generalLog = OSLog(subsystem: subsystem, category: "General")

    /// Set to false to reduce console noise during development
    static var verboseLogging = false

    enum Category {
        case auth
        case network
        case team
        case general

        var log: OSLog {
            switch self {
            case .auth: return authLog
            case .network: return networkLog
            case .team: return teamLog
            case .general: return generalLog
            }
        }
    }

    /// Log debug information - only in DEBUG builds with verbose logging enabled
    static func debug(_ message: String, category: Category = .general) {
        #if DEBUG
        guard verboseLogging else { return }
        os_log(.debug, log: category.log, "%{public}@", message)
        #endif
    }

    /// Log info messages - only in DEBUG builds with verbose logging enabled
    static func info(_ message: String, category: Category = .general) {
        #if DEBUG
        guard verboseLogging else { return }
        os_log(.info, log: category.log, "%{public}@", message)
        #endif
    }

    /// Log errors - always logged
    static func error(_ message: String, category: Category = .general) {
        os_log(.error, log: category.log, "%{public}@", message)
    }

    /// Log auth-specific messages - only when verbose logging is enabled
    static func auth(_ message: String) {
        #if DEBUG
        guard verboseLogging else { return }
        os_log(.debug, log: authLog, "🔐 %{public}@", message)
        #endif
    }

    /// Log network-specific messages - only when verbose logging is enabled
    static func network(_ message: String) {
        #if DEBUG
        guard verboseLogging else { return }
        os_log(.debug, log: networkLog, "🌐 %{public}@", message)
        #endif
    }

    /// Log team-specific messages - only when verbose logging is enabled
    static func team(_ message: String) {
        #if DEBUG
        guard verboseLogging else { return }
        os_log(.debug, log: teamLog, "🏀 %{public}@", message)
        #endif
    }
}

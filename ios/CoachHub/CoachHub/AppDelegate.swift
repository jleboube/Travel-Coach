//
//  AppDelegate.swift
//  CoachHub
//
//  SwiftUI app delegate with push notification support
//

import UIKit
import UserNotifications

class AppDelegate: UIResponder, UIApplicationDelegate {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Request notification permissions
        requestNotificationPermissions()

        return true
    }

    // MARK: - Push Notifications

    /// Request permission to send notifications
    private func requestNotificationPermissions() {
        let center = UNUserNotificationCenter.current()
        center.delegate = self

        center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                AppLogger.error("Failed to request notification authorization: \(error.localizedDescription)")
                return
            }

            if granted {
                AppLogger.info("Notification permission granted")
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            } else {
                AppLogger.info("Notification permission denied")
            }
        }
    }

    /// Called when APNs successfully registers the device
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Convert device token to string
        let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        AppLogger.auth("APNs device token: \(tokenString)")

        // Register token with backend
        Task {
            await DeviceTokenService.shared.registerToken(tokenString)
        }
    }

    /// Called when APNs registration fails
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        AppLogger.error("Failed to register for remote notifications: \(error.localizedDescription)")
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension AppDelegate: UNUserNotificationCenterDelegate {

    /// Handle notification when app is in foreground
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        // Show the notification even when the app is in foreground
        completionHandler([.banner, .sound, .badge])
    }

    /// Handle notification tap
    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let userInfo = response.notification.request.content.userInfo

        // Handle deep linking based on notification type
        if let type = userInfo["type"] as? String {
            handleNotificationTap(type: type, userInfo: userInfo)
        }

        completionHandler()
    }

    /// Route to the appropriate view based on notification type
    private func handleNotificationTap(type: String, userInfo: [AnyHashable: Any]) {
        switch type {
        case "event_reminder":
            if let eventId = userInfo["eventId"] as? String {
                AppLogger.info("Opening event: \(eventId)")
                // Post notification to navigate to event detail
                NotificationCenter.default.post(
                    name: .openEventDetail,
                    object: nil,
                    userInfo: ["eventId": eventId]
                )
            }

        case "tournament_travel":
            if let tournamentId = userInfo["tournamentId"] as? String {
                AppLogger.info("Opening tournament: \(tournamentId)")
                // Post notification to navigate to tournament detail
                NotificationCenter.default.post(
                    name: .openTournamentDetail,
                    object: nil,
                    userInfo: ["tournamentId": tournamentId]
                )
            }

        case "announcement":
            if let announcementId = userInfo["announcementId"] as? String {
                AppLogger.info("Opening announcement: \(announcementId)")
                // Post notification to navigate to announcements
                NotificationCenter.default.post(
                    name: .openAnnouncements,
                    object: nil,
                    userInfo: ["announcementId": announcementId]
                )
            }

        default:
            AppLogger.info("Unknown notification type: \(type)")
        }
    }
}

// MARK: - Notification Names for Deep Linking

extension Notification.Name {
    static let openEventDetail = Notification.Name("openEventDetail")
    static let openTournamentDetail = Notification.Name("openTournamentDetail")
    static let openAnnouncements = Notification.Name("openAnnouncements")
}

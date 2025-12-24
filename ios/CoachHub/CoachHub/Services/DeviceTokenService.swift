//
//  DeviceTokenService.swift
//  CoachHub
//
//  Service for registering and managing push notification device tokens
//

import Foundation

@MainActor
class DeviceTokenService: ObservableObject {
    static let shared = DeviceTokenService()

    private let apiClient = APIClient.shared
    private var currentToken: String?

    private init() {}

    /// Register the device token with the backend
    func registerToken(_ token: String) async {
        // Store locally for re-registration on login
        currentToken = token

        // Only register if user is authenticated
        guard AuthService.shared.isAuthenticated else {
            AppLogger.debug("Skipping token registration - user not authenticated")
            return
        }

        do {
            let request = RegisterTokenRequest(token: token, platform: "ios")

            let _: RegisterTokenResponse = try await apiClient.post(
                "/device-tokens",
                body: request
            )

            AppLogger.info("Device token registered successfully")
        } catch {
            AppLogger.error("Failed to register device token: \(error.localizedDescription)")
        }
    }

    /// Re-register the current token (call after login)
    func reregisterCurrentToken() async {
        guard let token = currentToken else {
            AppLogger.debug("No device token to re-register")
            return
        }

        await registerToken(token)
    }

    /// Unregister the device token (call on logout)
    func unregisterToken() async {
        guard let token = currentToken else {
            AppLogger.debug("No device token to unregister")
            return
        }

        do {
            // DELETE /device-tokens?token=xxx
            try await apiClient.delete("/device-tokens?token=\(token)")

            AppLogger.info("Device token unregistered successfully")
        } catch {
            // Don't fail logout if token unregistration fails
            AppLogger.error("Failed to unregister device token: \(error.localizedDescription)")
        }
    }
}

// MARK: - Request/Response Models

private struct RegisterTokenRequest: Codable {
    let token: String
    let platform: String
}

private struct RegisterTokenResponse: Codable {
    let id: String?
    let token: String?
    let platform: String?
}

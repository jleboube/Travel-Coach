//
//  AuthService.swift
//  CoachHub
//
//  Authentication service with Sign in with Apple
//

import Foundation
import AuthenticationServices

class AuthService: ObservableObject {
    static let shared = AuthService()

    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var errorMessage: String?

    private let keychainManager = KeychainManager.shared
    private let biometricManager = BiometricAuthManager.shared

    private init() {
        checkAuthenticationStatus()
    }

    // MARK: - Check Auth Status

    func checkAuthenticationStatus() {
        if keychainManager.getAuthToken() != nil,
           keychainManager.getUserId() != nil {
            isAuthenticated = true
            // Optionally fetch user details
            Task {
                await fetchCurrentUser()
            }
        } else {
            isAuthenticated = false
            currentUser = nil
        }
    }

    // MARK: - Sign in with Apple

    func handleSignInWithApple(authorization: ASAuthorization) async throws {
        AppLogger.auth("Starting Sign in with Apple...")

        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            AppLogger.error("Invalid credential type", category: .auth)
            throw AuthError.invalidCredential
        }

        guard let identityToken = appleIDCredential.identityToken,
              let identityTokenString = String(data: identityToken, encoding: .utf8) else {
            AppLogger.error("Failed to get identity token", category: .auth)
            throw AuthError.invalidToken
        }

        guard let authCode = appleIDCredential.authorizationCode,
              let authCodeString = String(data: authCode, encoding: .utf8) else {
            AppLogger.error("Failed to get authorization code", category: .auth)
            throw AuthError.invalidAuthCode
        }

        // Prepare request
        let request = AppleAuthRequest(
            identityToken: identityTokenString,
            authorizationCode: authCodeString,
            fullName: appleIDCredential.fullName,
            email: appleIDCredential.email
        )

        // Send to backend
        do {
            let response = try await sendAppleAuthToBackend(request)

            // Save authentication data
            _ = keychainManager.saveAuthToken(response.token)
            _ = keychainManager.saveUserId(response.user.id)
            if let email = response.user.email {
                _ = keychainManager.saveUserEmail(email)
            }

            // Update state
            await MainActor.run {
                self.currentUser = response.user
                self.isAuthenticated = true
                self.errorMessage = nil
            }

            // Register device token for push notifications
            await DeviceTokenService.shared.reregisterCurrentToken()

            AppLogger.auth("Sign in with Apple completed successfully")
        } catch {
            AppLogger.error("Backend communication failed: \(error.localizedDescription)", category: .auth)
            throw error
        }
    }

    // MARK: - Backend Communication

    private func sendAppleAuthToBackend(_ request: AppleAuthRequest) async throws -> AppleAuthResponse {
        let url = URL(string: "\(Config.apiBaseURL)/ios-auth/apple")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        urlRequest.timeoutInterval = 30.0

        AppLogger.network("Preparing Apple auth request to: \(url.absoluteString)")

        let encoder = JSONEncoder()
        // Use camelCase to match backend expectations
        urlRequest.httpBody = try encoder.encode(request)
        AppLogger.network("Payload size: \(urlRequest.httpBody?.count ?? 0) bytes")
        do {
            let (data, response) = try await URLSession.shared.data(for: urlRequest)
            AppLogger.network("Received response")

            guard let httpResponse = response as? HTTPURLResponse else {
                AppLogger.error("Response is not HTTPURLResponse", category: .network)
                throw AuthError.networkError
            }

            AppLogger.network("Status: \(httpResponse.statusCode), Size: \(data.count) bytes")

            guard httpResponse.statusCode == 200 else {
                if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                    AppLogger.error("Server error: \(errorResponse.error)", category: .auth)
                    throw AuthError.serverError(errorResponse.error)
                }
                AppLogger.error("Authentication failed with status \(httpResponse.statusCode)", category: .auth)
                throw AuthError.serverError("Authentication failed")
            }

            let decoder = JSONDecoder()
            // Backend sends camelCase, so no conversion needed

            // Configure ISO8601 date decoding with fractional seconds support
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)

                // Create formatter inside closure to avoid Sendable issues
                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

                if let date = formatter.date(from: dateString) {
                    return date
                }

                // Fallback without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                if let date = formatter.date(from: dateString) {
                    return date
                }

                throw DecodingError.dataCorruptedError(
                    in: container,
                    debugDescription: "Cannot decode date from: \(dateString)"
                )
            }

            return try decoder.decode(AppleAuthResponse.self, from: data)
        } catch let error as AuthError {
            throw error
        } catch {
            AppLogger.error("Network error: \(error.localizedDescription)", category: .network)
            throw AuthError.networkError
        }
    }

    // MARK: - Fetch Current User

    func fetchCurrentUser() async {
        guard let token = keychainManager.getAuthToken() else { return }

        do {
            let url = URL(string: "\(Config.apiBaseURL)/auth/me")!
            var urlRequest = URLRequest(url: url)
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

            AppLogger.network("Fetching current user from: \(url.absoluteString)")
            let (data, response) = try await URLSession.shared.data(for: urlRequest)

            // Check response status
            if let httpResponse = response as? HTTPURLResponse {
                AppLogger.network("Status: \(httpResponse.statusCode)")
                if httpResponse.statusCode != 200 {
                    AppLogger.error("Failed to fetch user: HTTP \(httpResponse.statusCode)", category: .auth)
                    return
                }
            }

            let decoder = JSONDecoder()
            // Backend sends camelCase, so no conversion needed (removed convertFromSnakeCase)

            // Configure ISO8601 date decoding with fractional seconds support
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)

                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

                if let date = formatter.date(from: dateString) {
                    return date
                }

                // Fallback without fractional seconds
                formatter.formatOptions = [.withInternetDateTime]
                if let date = formatter.date(from: dateString) {
                    return date
                }

                throw DecodingError.dataCorruptedError(
                    in: container,
                    debugDescription: "Cannot decode date from: \(dateString)"
                )
            }

            let user = try decoder.decode(User.self, from: data)
            AppLogger.auth("Successfully fetched user: \(user.displayName)")

            await MainActor.run {
                self.currentUser = user
            }
        } catch {
            AppLogger.error("Failed to fetch current user: \(error.localizedDescription)", category: .auth)
        }
    }

    // MARK: - Biometric Authentication

    func authenticateWithBiometrics() async throws {
        guard biometricManager.isBiometricAvailable() else {
            throw BiometricAuthManager.BiometricError.notAvailable
        }

        guard biometricManager.isBiometricAuthEnabled else {
            throw BiometricAuthManager.BiometricError.notEnrolled
        }

        try await biometricManager.authenticate()

        // If biometric auth succeeds, check if we have valid credentials
        await MainActor.run {
            checkAuthenticationStatus()
        }
    }

    // MARK: - Update Profile

    func updateProfile(name: String? = nil, role: UserRole? = nil) async throws {
        guard let token = keychainManager.getAuthToken() else {
            throw AuthError.notAuthenticated
        }

        var updateData: [String: Any] = [:]
        if let name = name {
            updateData["name"] = name
        }
        if let role = role {
            updateData["role"] = role.rawValue
        }

        guard !updateData.isEmpty else {
            AppLogger.error("No data to update", category: .auth)
            return
        }

        let url = URL(string: "\(Config.apiBaseURL)/auth/me")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "PATCH"
        urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let jsonData = try JSONSerialization.data(withJSONObject: updateData)
        urlRequest.httpBody = jsonData

        AppLogger.auth("Updating profile...")

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.networkError
        }

        guard httpResponse.statusCode == 200 else {
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw AuthError.serverError(errorResponse.error)
            }
            throw AuthError.serverError("Failed to update profile")
        }

        // Decode and update current user
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let dateString = try container.decode(String.self)

            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

            if let date = formatter.date(from: dateString) {
                return date
            }

            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: dateString) {
                return date
            }

            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Cannot decode date from: \(dateString)"
            )
        }

        let updatedUser = try decoder.decode(User.self, from: data)
        AppLogger.auth("Profile updated successfully: \(updatedUser.displayName)")

        await MainActor.run {
            self.currentUser = updatedUser
        }
    }

    // MARK: - Sign Out

    func signOut() {
        // Unregister device token for push notifications
        Task {
            await DeviceTokenService.shared.unregisterToken()
        }

        keychainManager.deleteAuthToken()
        keychainManager.delete(Config.userIdKey)
        keychainManager.delete(Config.userEmailKey)

        isAuthenticated = false
        currentUser = nil
        errorMessage = nil
    }

    // MARK: - Delete Account

    func deleteAccount() async throws {
        guard let token = keychainManager.getAuthToken() else {
            throw AuthError.notAuthenticated
        }

        let url = URL(string: "\(Config.apiBaseURL)/auth/delete")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "DELETE"
        urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (_, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw AuthError.serverError("Failed to delete account")
        }

        signOut()
    }
}

// MARK: - Auth Errors

enum AuthError: LocalizedError {
    case invalidCredential
    case invalidToken
    case invalidAuthCode
    case networkError
    case serverError(String)
    case notAuthenticated

    var errorDescription: String? {
        switch self {
        case .invalidCredential:
            return "Invalid Apple ID credential"
        case .invalidToken:
            return "Invalid identity token"
        case .invalidAuthCode:
            return "Invalid authorization code"
        case .networkError:
            return "Network connection failed"
        case .serverError(let message):
            return message
        case .notAuthenticated:
            return "Not authenticated"
        }
    }
}

// MARK: - Error Response

struct ErrorResponse: Codable {
    let error: String
}

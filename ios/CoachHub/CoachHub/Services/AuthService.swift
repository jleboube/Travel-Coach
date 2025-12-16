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
        if let token = keychainManager.getAuthToken(),
           let userId = keychainManager.getUserId() {
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
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            throw AuthError.invalidCredential
        }

        guard let identityToken = appleIDCredential.identityToken,
              let identityTokenString = String(data: identityToken, encoding: .utf8) else {
            throw AuthError.invalidToken
        }

        guard let authCode = appleIDCredential.authorizationCode,
              let authCodeString = String(data: authCode, encoding: .utf8) else {
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
    }

    // MARK: - Backend Communication

    private func sendAppleAuthToBackend(_ request: AppleAuthRequest) async throws -> AppleAuthResponse {
        let url = URL(string: "\(Config.apiBaseURL)/auth/apple")!
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = "POST"
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        urlRequest.httpBody = try encoder.encode(request)

        let (data, response) = try await URLSession.shared.data(for: urlRequest)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.networkError
        }

        guard httpResponse.statusCode == 200 else {
            if let errorResponse = try? JSONDecoder().decode(ErrorResponse.self, from: data) {
                throw AuthError.serverError(errorResponse.error)
            }
            throw AuthError.serverError("Authentication failed")
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601

        return try decoder.decode(AppleAuthResponse.self, from: data)
    }

    // MARK: - Fetch Current User

    func fetchCurrentUser() async {
        guard let token = keychainManager.getAuthToken() else { return }

        do {
            let url = URL(string: "\(Config.apiBaseURL)/auth/me")!
            var urlRequest = URLRequest(url: url)
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

            let (data, _) = try await URLSession.shared.data(for: urlRequest)

            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            decoder.dateDecodingStrategy = .iso8601

            let user = try decoder.decode(User.self, from: data)

            await MainActor.run {
                self.currentUser = user
            }
        } catch {
            print("Failed to fetch current user: \(error)")
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

    // MARK: - Sign Out

    func signOut() {
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

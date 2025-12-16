//
//  AuthViewModel.swift
//  CoachHub
//
//  ViewModel for authentication views
//

import Foundation
import AuthenticationServices

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showBiometricOption = false

    private let authService = AuthService.shared
    private let biometricManager = BiometricAuthManager.shared

    var isAuthenticated: Bool {
        authService.isAuthenticated
    }

    var currentUser: User? {
        authService.currentUser
    }

    var biometricType: BiometricAuthManager.BiometricType {
        biometricManager.biometricType()
    }

    var biometricButtonTitle: String {
        switch biometricType {
        case .faceID:
            return "Use Face ID"
        case .touchID:
            return "Use Touch ID"
        case .none:
            return "Biometric not available"
        }
    }

    init() {
        checkBiometricAvailability()
    }

    // MARK: - Check Biometric Availability

    func checkBiometricAvailability() {
        showBiometricOption = biometricManager.isBiometricAvailable() &&
                              biometricManager.isBiometricAuthEnabled &&
                              KeychainManager.shared.getAuthToken() != nil
    }

    // MARK: - Handle Sign in with Apple

    func handleSignInWithApple(_ authorization: ASAuthorization) async {
        isLoading = true
        errorMessage = nil

        do {
            try await authService.handleSignInWithApple(authorization: authorization)

            // Enable biometric auth for future logins
            if biometricManager.isBiometricAvailable() {
                biometricManager.isBiometricAuthEnabled = true
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Handle Biometric Auth

    func handleBiometricAuth() async {
        isLoading = true
        errorMessage = nil

        do {
            try await authService.authenticateWithBiometrics()
        } catch let error as BiometricAuthManager.BiometricError {
            errorMessage = error.message
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    // MARK: - Sign Out

    func signOut() {
        authService.signOut()
        errorMessage = nil
    }

    // MARK: - Delete Account

    func deleteAccount() async {
        isLoading = true
        errorMessage = nil

        do {
            try await authService.deleteAccount()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

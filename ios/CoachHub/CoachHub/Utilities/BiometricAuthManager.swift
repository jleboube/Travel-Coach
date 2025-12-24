//
//  BiometricAuthManager.swift
//  CoachHub
//
//  Manages Face ID and Touch ID authentication
//

import Foundation
import LocalAuthentication

class BiometricAuthManager {
    static let shared = BiometricAuthManager()

    private init() {}

    enum BiometricType {
        case none
        case faceID
        case touchID
        case opticID
    }

    enum BiometricError: Error {
        case notAvailable
        case notEnrolled
        case authenticationFailed
        case userCancel
        case userFallback
        case systemCancel
        case passcodeNotSet
        case unknown

        var message: String {
            switch self {
            case .notAvailable:
                return "Biometric authentication is not available on this device"
            case .notEnrolled:
                return "No biometric authentication is enrolled"
            case .authenticationFailed:
                return "Authentication failed"
            case .userCancel:
                return "Authentication was cancelled"
            case .userFallback:
                return "User chose to enter password"
            case .systemCancel:
                return "Authentication was cancelled by system"
            case .passcodeNotSet:
                return "Passcode is not set on device"
            case .unknown:
                return "An unknown error occurred"
            }
        }
    }

    // MARK: - Check Availability

    func biometricType() -> BiometricType {
        let context = LAContext()
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            return .none
        }

        switch context.biometryType {
        case .faceID:
            return .faceID
        case .touchID:
            return .touchID
        case .opticID:
            return .opticID
        case .none:
            return .none
        @unknown default:
            return .none
        }
    }

    func isBiometricAvailable() -> Bool {
        biometricType() != .none
    }

    // MARK: - Authenticate

    func authenticate(reason: String = "Authenticate to access CoachHub") async throws {
        let context = LAContext()
        context.localizedCancelTitle = "Enter Password"

        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            if let error = error {
                throw mapError(error)
            }
            throw BiometricError.notAvailable
        }

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )

            if !success {
                throw BiometricError.authenticationFailed
            }
        } catch let error as LAError {
            throw mapLAError(error)
        } catch {
            throw BiometricError.unknown
        }
    }

    // MARK: - Error Mapping

    private func mapError(_ error: NSError) -> BiometricError {
        switch error.code {
        case LAError.Code.biometryNotAvailable.rawValue:
            return .notAvailable
        case LAError.Code.biometryNotEnrolled.rawValue:
            return .notEnrolled
        case LAError.Code.passcodeNotSet.rawValue:
            return .passcodeNotSet
        default:
            return .unknown
        }
    }

    private func mapLAError(_ error: LAError) -> BiometricError {
        switch error.code {
        case .authenticationFailed:
            return .authenticationFailed
        case .userCancel:
            return .userCancel
        case .userFallback:
            return .userFallback
        case .systemCancel:
            return .systemCancel
        case .passcodeNotSet:
            return .passcodeNotSet
        case .biometryNotAvailable:
            return .notAvailable
        case .biometryNotEnrolled:
            return .notEnrolled
        default:
            return .unknown
        }
    }

    // MARK: - User Preferences

    private let biometricEnabledKey = "biometric_auth_enabled"

    var isBiometricAuthEnabled: Bool {
        get {
            UserDefaults.standard.bool(forKey: biometricEnabledKey)
        }
        set {
            UserDefaults.standard.set(newValue, forKey: biometricEnabledKey)
        }
    }
}

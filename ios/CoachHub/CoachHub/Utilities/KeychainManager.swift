//
//  KeychainManager.swift
//  CoachHub
//
//  Secure storage for authentication tokens and sensitive data
//

import Foundation
import Security

class KeychainManager {
    static let shared = KeychainManager()

    private init() {}

    // MARK: - Save

    func save(_ data: Data, for key: String) -> Bool {
        // Delete any existing item
        delete(key)

        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }

    func save(_ string: String, for key: String) -> Bool {
        guard let data = string.data(using: .utf8) else { return false }
        return save(data, for: key)
    }

    // MARK: - Retrieve

    func getData(for key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else { return nil }
        return result as? Data
    }

    func getString(for key: String) -> String? {
        guard let data = getData(for: key) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Delete

    @discardableResult
    func delete(_ key: String) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]

        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess || status == errSecItemNotFound
    }

    // MARK: - Clear All

    func clearAll() {
        let secClasses = [
            kSecClassGenericPassword,
            kSecClassInternetPassword,
            kSecClassCertificate,
            kSecClassKey,
            kSecClassIdentity
        ]

        for secClass in secClasses {
            let query: [String: Any] = [kSecClass as String: secClass]
            SecItemDelete(query as CFDictionary)
        }
    }
}

// MARK: - Auth Token Management

extension KeychainManager {
    func saveAuthToken(_ token: String) -> Bool {
        save(token, for: Config.authTokenKey)
    }

    func getAuthToken() -> String? {
        getString(for: Config.authTokenKey)
    }

    func deleteAuthToken() {
        delete(Config.authTokenKey)
    }

    func saveUserId(_ userId: String) -> Bool {
        save(userId, for: Config.userIdKey)
    }

    func getUserId() -> String? {
        getString(for: Config.userIdKey)
    }

    func saveUserEmail(_ email: String) -> Bool {
        save(email, for: Config.userEmailKey)
    }

    func getUserEmail() -> String? {
        getString(for: Config.userEmailKey)
    }
}

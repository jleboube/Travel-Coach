//
//  ProfileView.swift
//  CoachHub
//

import SwiftUI

struct ProfileView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var authService = AuthService.shared
    @State private var showingDeleteConfirmation = false
    @State private var showingEditProfile = false

    var body: some View {
        NavigationView {
            List {
                userInfoSection
                biometricSection
                aboutSection
                actionsSection
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Delete Account", isPresented: $showingDeleteConfirmation) {
                Button("Cancel", role: .cancel) {}
                Button("Delete", role: .destructive) {
                    Task {
                        try? await authService.deleteAccount()
                        dismiss()
                    }
                }
            } message: {
                Text("Are you sure you want to delete your account? This action cannot be undone.")
            }
            .sheet(isPresented: $showingEditProfile) {
                EditProfileView()
            }
        }
    }

    private var userInfoSection: some View {
        Section {
            HStack {
                ZStack {
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 60, height: 60)

                    Text(authService.currentUser?.initials ?? "??")
                        .font(.title2.bold())
                        .foregroundColor(.blue)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(authService.currentUser?.displayName ?? "Unknown")
                        .font(.headline)

                    Text(authService.currentUser?.email ?? "")
                        .font(.subheadline)
                        .foregroundColor(.secondary)

                    Text(authService.currentUser?.role.displayName ?? "")
                        .font(.caption)
                        .foregroundColor(.secondary)

                    if let team = authService.currentUser?.team {
                        HStack(spacing: 4) {
                            Image(systemName: "person.3.fill")
                                .font(.caption2)
                            Text(team.name)
                                .font(.caption)
                        }
                        .foregroundColor(.blue)
                        .padding(.top, 2)
                    }
                }

                Spacer()

                Button(action: { showingEditProfile = true }) {
                    Image(systemName: "pencil.circle.fill")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
            .padding(.vertical, 8)
        }
    }

    private var biometricSection: some View {
        Section("Biometric Authentication") {
            Toggle(biometricToggleTitle,
                   isOn: Binding(
                    get: { BiometricAuthManager.shared.isBiometricAuthEnabled },
                    set: { BiometricAuthManager.shared.isBiometricAuthEnabled = $0 }
                   ))
        }
    }

    private var biometricToggleTitle: String {
        let type = BiometricAuthManager.shared.biometricType()
        switch type {
        case .faceID:
            return "Enable Face ID"
        case .touchID:
            return "Enable Touch ID"
        case .opticID:
            return "Enable Optic ID"
        case .none:
            return "Biometric Authentication"
        }
    }

    private var aboutSection: some View {
        Section("About") {
            HStack {
                Text("Version")
                Spacer()
                Text(Config.appVersion)
                    .foregroundColor(.secondary)
            }

            HStack {
                Text("Build")
                Spacer()
                Text(Config.appBuild)
                    .foregroundColor(.secondary)
            }
        }
    }

    private var actionsSection: some View {
        Section {
            Button(role: .destructive) {
                authService.signOut()
                dismiss()
            } label: {
                HStack {
                    Spacer()
                    Text("Sign Out")
                    Spacer()
                }
            }

            Button(role: .destructive) {
                showingDeleteConfirmation = true
            } label: {
                HStack {
                    Spacer()
                    Text("Delete Account")
                    Spacer()
                }
            }
        }
    }
}

#Preview {
    ProfileView()
}

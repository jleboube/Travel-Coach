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
    @State private var showCopiedToast = false

    var body: some View {
        NavigationView {
            List {
                userInfoSection
                if authService.currentUser?.team != nil {
                    teamSection
                }
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
            .overlay(alignment: .bottom) {
                if showCopiedToast {
                    Text("Join code copied!")
                        .font(.subheadline.bold())
                        .foregroundColor(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.green)
                        .cornerRadius(8)
                        .padding(.bottom, 40)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
            .animation(.easeInOut(duration: 0.3), value: showCopiedToast)
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

    private var teamSection: some View {
        Section("Team") {
            if let team = authService.currentUser?.team {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(team.name)
                                .font(.headline)
                            Text(team.season)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                    }

                    Divider()

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Invite Code")
                            .font(.caption)
                            .foregroundColor(.secondary)

                        HStack {
                            Text(team.joinCode)
                                .font(.system(.title2, design: .monospaced))
                                .fontWeight(.bold)
                                .foregroundColor(.blue)

                            Spacer()

                            Button(action: {
                                UIPasteboard.general.string = team.joinCode
                                showCopiedToast = true
                                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                    showCopiedToast = false
                                }
                            }) {
                                Image(systemName: "doc.on.doc")
                                    .font(.title3)
                                    .foregroundColor(.blue)
                            }

                            ShareLink(item: "Join my team on Travel-Coach! Use invite code: \(team.joinCode)") {
                                Image(systemName: "square.and.arrow.up")
                                    .font(.title3)
                                    .foregroundColor(.blue)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .padding(.vertical, 4)
            }
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

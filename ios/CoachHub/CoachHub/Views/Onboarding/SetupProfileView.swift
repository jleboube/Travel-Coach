//
//  SetupProfileView.swift
//  CoachHub
//
//  Initial profile setup for users who signed in with Apple
//  but didn't have their name shared (Apple private relay users)
//

import SwiftUI

struct SetupProfileView: View {
    @StateObject private var authService = AuthService.shared

    @State private var name: String = ""
    @State private var selectedRole: UserRole = .HEAD_COACH
    @State private var isLoading = false
    @State private var errorMessage: String?

    let onComplete: () -> Void

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                Spacer()

                // Icon
                Image(systemName: "person.crop.circle.badge.plus")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 80, height: 80)
                    .foregroundColor(.blue)

                // Welcome Text
                VStack(spacing: 12) {
                    Text("Complete Your Profile")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Let's set up your profile so your team knows who you are")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                // Form
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Your Name")
                            .font(.subheadline)
                            .fontWeight(.medium)

                        TextField("Enter your full name", text: $name)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .autocapitalization(.words)
                            .textContentType(.name)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Your Role")
                            .font(.subheadline)
                            .fontWeight(.medium)

                        Picker("Role", selection: $selectedRole) {
                            ForEach([UserRole.HEAD_COACH, .ASSISTANT_COACH, .TEAM_MANAGER, .PARENT, .PLAYER], id: \.self) { role in
                                Text(role.displayName).tag(role)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())
                    }
                }
                .padding(.horizontal)

                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }

                Spacer()

                // Continue Button
                Button(action: saveProfile) {
                    if isLoading {
                        HStack {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            Text("Saving...")
                        }
                    } else {
                        Text("Continue")
                    }
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(name.trimmingCharacters(in: .whitespaces).isEmpty || isLoading ? Color.gray : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
                .padding(.horizontal, 32)
                .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)

                // Skip option for users who want to do this later
                Button("Skip for now") {
                    onComplete()
                }
                .foregroundColor(.secondary)
                .padding(.bottom, 40)
                .disabled(isLoading)
            }
            .navigationTitle("")
            .navigationBarHidden(true)
        }
    }

    private func saveProfile() {
        let trimmedName = name.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else {
            errorMessage = "Please enter your name"
            return
        }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                try await authService.updateProfile(name: trimmedName, role: selectedRole)

                await MainActor.run {
                    isLoading = false
                    onComplete()
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    if let authError = error as? AuthError {
                        errorMessage = authError.errorDescription
                    } else {
                        errorMessage = error.localizedDescription
                    }
                }
            }
        }
    }
}

#Preview {
    SetupProfileView(onComplete: {})
}

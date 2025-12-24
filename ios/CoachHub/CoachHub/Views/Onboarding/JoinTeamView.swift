//
//  JoinTeamView.swift
//  CoachHub
//
//  View for joining an existing team with a join code
//

import SwiftUI

struct JoinTeamView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var authService = AuthService.shared

    @State private var joinCode = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccessSheet = false
    @State private var joinedTeam: Team?

    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                // Icon
                Image(systemName: "person.badge.plus")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 80, height: 80)
                    .foregroundColor(.green)
                    .padding(.top, 40)

                // Instructions
                VStack(spacing: 12) {
                    Text("Join a Team")
                        .font(.title)
                        .fontWeight(.bold)

                    Text("Enter the join code provided by your team coach")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                // Join Code Input
                VStack(alignment: .leading, spacing: 8) {
                    Text("Join Code")
                        .font(.subheadline)
                        .fontWeight(.medium)

                    TextField("Enter join code", text: $joinCode)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                        .font(.title3)
                        .padding(.horizontal)
                }
                .padding(.horizontal)

                if let errorMessage = errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }

                Spacer()

                // Join Button
                Button(action: joinTeam) {
                    if isLoading {
                        HStack {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            Text("Joining Team...")
                        }
                    } else {
                        Text("Join Team")
                    }
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(joinCode.isEmpty || isLoading ? Color.gray : Color.green)
                .foregroundColor(.white)
                .cornerRadius(12)
                .padding(.horizontal, 32)
                .disabled(joinCode.isEmpty || isLoading)

                Button("Cancel") {
                    dismiss()
                }
                .disabled(isLoading)
                .padding(.bottom, 40)
            }
            .navigationTitle("")
            .navigationBarHidden(true)
            .sheet(isPresented: $showingSuccessSheet) {
                if let team = joinedTeam {
                    TeamJoinedSuccessView(team: team) {
                        dismiss()
                    }
                }
            }
        }
    }

    private func joinTeam() {
        guard !joinCode.isEmpty else { return }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                let team = try await TeamService.shared.joinTeam(joinCode: joinCode.trimmingCharacters(in: .whitespaces))

                await MainActor.run {
                    joinedTeam = team
                    isLoading = false
                    showingSuccessSheet = true
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    if let apiError = error as? APIError {
                        switch apiError {
                        case .serverError(let message):
                            if message.contains("Invalid join code") {
                                errorMessage = "This join code is not valid. Please check and try again."
                            } else if message.contains("already a member") {
                                errorMessage = "You're already a member of this team."
                            } else {
                                errorMessage = message
                            }
                        case .httpError(let code):
                            if code == 401 {
                                errorMessage = "Your session has expired. Please sign in again."
                            } else if code == 404 {
                                errorMessage = "This join code is not valid. Please check and try again."
                            } else {
                                errorMessage = "Error: \(code)"
                            }
                        case .networkError:
                            errorMessage = "Network error. Please check your connection."
                        case .decodingError:
                            errorMessage = "Invalid response from server."
                        case .invalidResponse:
                            errorMessage = "Invalid server response."
                        }
                    } else {
                        errorMessage = error.localizedDescription
                    }
                }
            }
        }
    }
}

// Success Sheet
struct TeamJoinedSuccessView: View {
    let team: Team
    let onDismiss: () -> Void
    @StateObject private var authService = AuthService.shared

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            // Success Icon
            Image(systemName: "checkmark.circle.fill")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 80, height: 80)
                .foregroundColor(.green)

            // Success Message
            VStack(spacing: 12) {
                Text("Success!")
                    .font(.title)
                    .fontWeight(.bold)

                Text("You've joined '\(team.name)'")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                // Team Details
                VStack(spacing: 8) {
                    HStack {
                        Text("Season:")
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(team.season)
                            .fontWeight(.medium)
                    }

                    if let ageGroup = team.ageGroup {
                        HStack {
                            Text("Age Group:")
                                .foregroundColor(.secondary)
                            Spacer()
                            Text(ageGroup)
                                .fontWeight(.medium)
                        }
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                .padding(.horizontal)
            }

            Spacer()

            // Done Button
            Button(action: {
                // Refresh user data to include the joined team
                // This will trigger the app to navigate to MainTabView
                Task {
                    await authService.fetchCurrentUser()
                    await MainActor.run {
                        onDismiss()
                    }
                }
            }) {
                Text("Get Started")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 40)
        }
    }
}

#Preview {
    JoinTeamView()
}

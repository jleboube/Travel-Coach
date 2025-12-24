//
//  CreateTeamView.swift
//  CoachHub
//
//  View for creating a new team
//

import SwiftUI

struct CreateTeamView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var authService = AuthService.shared

    @State private var teamName = ""
    @State private var season = ""
    @State private var ageGroup = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccessSheet = false
    @State private var createdTeam: Team?

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Team Information")) {
                    TextField("Team Name", text: $teamName)
                        .autocapitalization(.words)

                    TextField("Season (e.g., 2024 Spring)", text: $season)
                        .autocapitalization(.words)

                    TextField("Age Group (Optional)", text: $ageGroup)
                        .autocapitalization(.words)
                }

                if let errorMessage = errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }

                Section {
                    Button(action: createTeam) {
                        if isLoading {
                            HStack {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                                Text("Creating Team...")
                            }
                        } else {
                            Text("Create Team")
                                .frame(maxWidth: .infinity)
                                .fontWeight(.semibold)
                        }
                    }
                    .disabled(teamName.isEmpty || season.isEmpty || isLoading)
                }
            }
            .navigationTitle("Create Team")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .disabled(isLoading)
                }
            }
            .sheet(isPresented: $showingSuccessSheet) {
                if let team = createdTeam {
                    TeamCreatedSuccessView(team: team) {
                        dismiss()
                    }
                }
            }
        }
    }

    private func createTeam() {
        guard !teamName.isEmpty, !season.isEmpty else { return }

        isLoading = true
        errorMessage = nil

        Task {
            do {
                let team = try await TeamService.shared.createTeam(
                    name: teamName,
                    season: season,
                    ageGroup: ageGroup.isEmpty ? nil : ageGroup
                )

                await MainActor.run {
                    createdTeam = team
                    isLoading = false
                    showingSuccessSheet = true
                }
            } catch {
                await MainActor.run {
                    isLoading = false
                    if let apiError = error as? APIError {
                        switch apiError {
                        case .serverError(let message):
                            errorMessage = message
                        case .httpError(let code):
                            if code == 401 {
                                errorMessage = "Your session has expired. Please sign in again."
                            } else if code == 409 {
                                errorMessage = "A team with this name already exists. Please choose a different name."
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
struct TeamCreatedSuccessView: View {
    let team: Team
    let onDismiss: () -> Void
    @StateObject private var authService = AuthService.shared

    @State private var showingCopiedConfirmation = false

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
                Text("Team Created!")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Your team '\(team.name)' has been created successfully")
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            // Join Code Section
            VStack(spacing: 12) {
                Text("Share this code with your team members:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                HStack {
                    Text(team.joinCode)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.blue)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(8)

                    Button(action: copyJoinCode) {
                        Image(systemName: showingCopiedConfirmation ? "checkmark" : "doc.on.doc")
                            .foregroundColor(.blue)
                    }
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            .padding(.horizontal)

            Spacer()

            // Done Button
            Button(action: {
                // Refresh user data to include the new team
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
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 40)
        }
    }

    private func copyJoinCode() {
        UIPasteboard.general.string = team.joinCode
        withAnimation {
            showingCopiedConfirmation = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                showingCopiedConfirmation = false
            }
        }
    }
}

#Preview {
    CreateTeamView()
}

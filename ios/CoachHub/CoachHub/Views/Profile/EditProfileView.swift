//
//  EditProfileView.swift
//  CoachHub
//
//  View for editing user profile information
//

import SwiftUI

struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var authService = AuthService.shared

    @State private var name: String = ""
    @State private var selectedRole: UserRole = .HEAD_COACH
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showingSuccess = false

    let onSave: (() -> Void)?

    init(onSave: (() -> Void)? = nil) {
        self.onSave = onSave
    }

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Profile Information")) {
                    TextField("Your Name", text: $name)
                        .autocapitalization(.words)
                        .textContentType(.name)

                    Picker("Role", selection: $selectedRole) {
                        ForEach([UserRole.HEAD_COACH, .ASSISTANT_COACH, .TEAM_MANAGER, .PARENT, .PLAYER], id: \.self) { role in
                            Text(role.displayName).tag(role)
                        }
                    }
                }

                if let errorMessage = errorMessage {
                    Section {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .font(.caption)
                    }
                }

                Section {
                    Button(action: saveProfile) {
                        if isLoading {
                            HStack {
                                Spacer()
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                                Text("Saving...")
                                    .padding(.leading, 8)
                                Spacer()
                            }
                        } else {
                            HStack {
                                Spacer()
                                Text("Save Changes")
                                    .fontWeight(.semibold)
                                Spacer()
                            }
                        }
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .disabled(isLoading)
                }
            }
            .onAppear {
                loadCurrentValues()
            }
            .alert("Profile Updated", isPresented: $showingSuccess) {
                Button("OK") {
                    onSave?()
                    dismiss()
                }
            } message: {
                Text("Your profile has been updated successfully.")
            }
        }
    }

    private func loadCurrentValues() {
        if let user = authService.currentUser {
            name = user.name ?? ""
            selectedRole = user.role
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
                // Only update name if it changed, and role if it changed
                let currentUser = authService.currentUser
                let nameChanged = trimmedName != (currentUser?.name ?? "")
                let roleChanged = selectedRole != currentUser?.role

                if nameChanged || roleChanged {
                    try await authService.updateProfile(
                        name: nameChanged ? trimmedName : nil,
                        role: roleChanged ? selectedRole : nil
                    )
                }

                await MainActor.run {
                    isLoading = false
                    showingSuccess = true
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
    EditProfileView()
}

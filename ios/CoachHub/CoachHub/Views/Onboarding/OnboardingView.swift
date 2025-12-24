//
//  OnboardingView.swift
//  CoachHub
//
//  Team onboarding flow - create or join a team
//

import SwiftUI

struct OnboardingView: View {
    @State private var showingCreateTeam = false
    @State private var showingJoinTeam = false

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()

                // Logo or Icon
                Image(systemName: "person.3.fill")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 100, height: 100)
                    .foregroundColor(.blue)

                // Welcome Text
                VStack(spacing: 12) {
                    Text("Welcome to CoachHub")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("Get started by creating a new team or joining an existing one")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                Spacer()

                // Action Buttons
                VStack(spacing: 16) {
                    Button(action: {
                        showingCreateTeam = true
                    }) {
                        HStack {
                            Image(systemName: "plus.circle.fill")
                            Text("Create New Team")
                        }
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }

                    Button(action: {
                        showingJoinTeam = true
                    }) {
                        HStack {
                            Image(systemName: "person.badge.plus")
                            Text("Join Existing Team")
                        }
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
            }
            .navigationTitle("")
            .navigationBarHidden(true)
            .sheet(isPresented: $showingCreateTeam) {
                CreateTeamView()
            }
            .sheet(isPresented: $showingJoinTeam) {
                JoinTeamView()
            }
        }
    }
}

#Preview {
    OnboardingView()
}

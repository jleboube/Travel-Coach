//
//  DashboardView.swift
//  CoachHub
//

import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @State private var showingProfile = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Upcoming Events Section
                    if !viewModel.upcomingEvents.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Upcoming Events")
                                .font(.title2.bold())
                                .padding(.horizontal)

                            ForEach(viewModel.upcomingEvents.prefix(3)) { event in
                                EventCard(event: event)
                            }
                        }
                    }

                    // Quick Stats
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        StatCard(
                            title: "Players",
                            value: "\(viewModel.totalPlayers)",
                            icon: "person.3.fill",
                            color: .blue
                        )

                        StatCard(
                            title: "Events",
                            value: "\(viewModel.totalEvents)",
                            icon: "calendar",
                            color: .green
                        )

                        StatCard(
                            title: "Tournaments",
                            value: "\(viewModel.totalTournaments)",
                            icon: "trophy.fill",
                            color: .orange
                        )

                        StatCard(
                            title: "Workouts",
                            value: "\(viewModel.totalWorkouts)",
                            icon: "dumbbell.fill",
                            color: .purple
                        )
                    }
                    .padding(.horizontal)

                    // Recent Announcements
                    if !viewModel.announcements.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Announcements")
                                .font(.title2.bold())
                                .padding(.horizontal)

                            ForEach(viewModel.announcements.prefix(3)) { announcement in
                                AnnouncementCard(announcement: announcement)
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("CoachHub")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingProfile = true
                    } label: {
                        Image(systemName: "person.circle")
                    }
                }
            }
            .sheet(isPresented: $showingProfile) {
                ProfileView()
            }
            .refreshable {
                await viewModel.refresh()
            }
            .task {
                await viewModel.loadDashboard()
            }
        }
    }
}

struct EventCard: View {
    let event: Event

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: event.type.icon)
                .font(.title2)
                .foregroundColor(.white)
                .frame(width: 50, height: 50)
                .background(Color.blue)
                .cornerRadius(10)

            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.headline)
                Text(event.displayTime)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                if let location = event.location {
                    Text(location)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
        .padding(.horizontal)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title)
                .foregroundColor(color)

            Text(value)
                .font(.title.bold())

            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

struct AnnouncementCard: View {
    let announcement: Announcement

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: announcement.priority.icon)
                    .foregroundColor(Color(announcement.priority.color))

                Text(announcement.title)
                    .font(.headline)

                Spacer()

                Text(announcement.timeAgo)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(announcement.content)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
        .padding(.horizontal)
    }
}

#Preview {
    DashboardView()
}

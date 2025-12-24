//
//  DashboardView.swift
//  CoachHub
//
//  Professional dashboard with stats and upcoming events
//

import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    @State private var showingProfile = false

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Quick Stats Grid
                    statsSection

                    // Upcoming Events
                    if !viewModel.upcomingEvents.isEmpty {
                        upcomingEventsSection
                    }

                    // Recent Announcements
                    if !viewModel.announcements.isEmpty {
                        announcementsSection
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("CoachHub")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingProfile = true
                    } label: {
                        Image(systemName: "person.crop.circle.fill")
                            .font(.title3)
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

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Overview")
                .font(.title2.bold())
                .padding(.horizontal, 4)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
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
        }
    }

    private var upcomingEventsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Upcoming Events")
                    .font(.title2.bold())
                    .padding(.horizontal, 4)

                Spacer()

                NavigationLink(destination: ScheduleView()) {
                    Text("See All")
                        .font(.subheadline.bold())
                }
            }

            VStack(spacing: 12) {
                ForEach(viewModel.upcomingEvents.prefix(3)) { event in
                    NavigationLink(destination: EventDetailView(event: event)) {
                        EventCard(event: event)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var announcementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Announcements")
                .font(.title2.bold())
                .padding(.horizontal, 4)

            VStack(spacing: 12) {
                ForEach(viewModel.announcements.prefix(3)) { announcement in
                    AnnouncementCard(announcement: announcement)
                }
            }
        }
    }
}

// MARK: - Event Card

struct EventCard: View {
    let event: Event

    var body: some View {
        HStack(spacing: 16) {
            // Icon
            Image(systemName: event.type.icon)
                .font(.title2)
                .foregroundColor(.white)
                .frame(width: 56, height: 56)
                .background(typeColor)
                .cornerRadius(12)

            // Event Details
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.headline)
                    .foregroundColor(.primary)

                Text(event.displayTime)
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                if let location = event.location {
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.caption)
                        Text(location)
                            .font(.caption)
                    }
                    .foregroundColor(.secondary)
                }
            }

            Spacer()

            // Chevron
            Image(systemName: "chevron.right")
                .font(.caption.bold())
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }

    private var typeColor: Color {
        switch event.type {
        case .PRACTICE:
            return .blue
        case .GAME:
            return .green
        case .TOURNAMENT:
            return .purple
        case .TEAM_MEETING:
            return .orange
        case .FUNDRAISER:
            return .pink
        case .OFF_DAY:
            return .gray
        case .INDIVIDUAL_LESSON:
            return .teal
        }
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(color)

            Text(value)
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(.primary)

            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }
}

// MARK: - Announcement Card

struct AnnouncementCard: View {
    let announcement: Announcement

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: announcement.priority.icon)
                    .foregroundColor(Color(announcement.priority.color))
                    .font(.title3)

                Text(announcement.title)
                    .font(.headline)
                    .foregroundColor(.primary)

                Spacer()

                Text(announcement.timeAgo)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(announcement.content)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(3)
                .multilineTextAlignment(.leading)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

#Preview {
    DashboardView()
}

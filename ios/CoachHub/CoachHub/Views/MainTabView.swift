//
//  MainTabView.swift
//  CoachHub
//
//  Main tab navigation
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            ScheduleView()
                .tabItem {
                    Label("Schedule", systemImage: "calendar")
                }
                .tag(1)

            RosterView()
                .tabItem {
                    Label("Roster", systemImage: "person.3.fill")
                }
                .tag(2)

            TravelView()
                .tabItem {
                    Label("Travel", systemImage: "airplane")
                }
                .tag(3)

            WorkoutsView()
                .tabItem {
                    Label("Workouts", systemImage: "dumbbell.fill")
                }
                .tag(4)
        }
        .tint(Color(red: 0.118, green: 0.251, blue: 0.686)) // #1e40af
    }
}

#Preview {
    MainTabView()
}

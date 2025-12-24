//
//  TravelView.swift
//  CoachHub
//

import SwiftUI

struct TravelView: View {
    @StateObject private var viewModel = TravelViewModel()

    var body: some View {
        NavigationView {
            List {
                // Upcoming Events with Travel Required
                if !viewModel.upcomingTravelEvents.isEmpty {
                    Section("Upcoming Events with Travel") {
                        ForEach(viewModel.upcomingTravelEvents) { event in
                            NavigationLink(destination: EventDetailView(event: event)) {
                                TravelEventRow(event: event)
                            }
                        }
                    }
                }

                // Upcoming Tournaments
                if !viewModel.upcomingTournaments.isEmpty {
                    Section("Upcoming Tournaments") {
                        ForEach(viewModel.upcomingTournaments) { tournament in
                            NavigationLink(destination: TournamentDetailView(tournament: tournament)) {
                                TournamentRow(tournament: tournament)
                            }
                        }
                    }
                }

                // Past Tournaments
                if !viewModel.pastTournaments.isEmpty {
                    Section("Past Tournaments") {
                        ForEach(viewModel.pastTournaments) { tournament in
                            NavigationLink(destination: TournamentDetailView(tournament: tournament)) {
                                TournamentRow(tournament: tournament)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Travel")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.showingAddTournament = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadData()
            }
            .task {
                await viewModel.loadData()
            }
            .sheet(isPresented: $viewModel.showingAddTournament) {
                AddTournamentView()
            }
        }
    }
}

struct TravelEventRow: View {
    let event: Event

    var body: some View {
        HStack(spacing: 12) {
            // Icon
            Image(systemName: event.type.icon)
                .font(.title3)
                .foregroundColor(.white)
                .frame(width: 44, height: 44)
                .background(typeColor)
                .cornerRadius(10)

            // Event details
            VStack(alignment: .leading, spacing: 4) {
                Text(event.title)
                    .font(.headline)

                if !event.allDay {
                    Text(event.displayTime)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }

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

            // Travel indicator
            Image(systemName: "airplane.circle.fill")
                .font(.title3)
                .foregroundColor(.orange)
        }
        .padding(.vertical, 4)
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

struct TournamentRow: View {
    let tournament: Tournament

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(tournament.name)
                .font(.headline)

            Text(tournament.dateRange)
                .font(.subheadline)
                .foregroundColor(.secondary)

            if let location = tournament.location {
                HStack {
                    Image(systemName: "mappin.circle")
                    Text(location)
                }
                .font(.caption)
                .foregroundColor(.secondary)
            }

            if let daysUntil = tournament.daysUntil, daysUntil > 0 {
                Text("\(daysUntil) days until tournament")
                    .font(.caption)
                    .foregroundColor(.blue)
            }
        }
        .padding(.vertical, 4)
    }
}

struct TournamentDetailView: View {
    let tournament: Tournament

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(tournament.name)
                    .font(.title.bold())

                VStack(alignment: .leading, spacing: 12) {
                    InfoRow(label: "Dates", value: tournament.dateRange)

                    if let location = tournament.location {
                        InfoRow(label: "Location", value: location)
                    }

                    if let fee = tournament.entryFee {
                        InfoRow(label: "Entry Fee", value: String(format: "$%.2f", fee))
                    }

                    if let hotelName = tournament.hotelName {
                        InfoRow(label: "Hotel", value: hotelName)
                    }

                    if let perDiem = tournament.perDiem {
                        InfoRow(label: "Per Diem", value: String(format: "$%.2f", perDiem))
                    }
                }

                if let notes = tournament.notes {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Notes")
                            .font(.headline)
                        Text(notes)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct InfoRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .bold()
        }
    }
}

struct AddTournamentView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = AddTournamentViewModel()

    var body: some View {
        NavigationView {
            Form {
                Section("Tournament Details") {
                    TextField("Name", text: $viewModel.name)

                    DatePicker("Start Date", selection: $viewModel.startDate, displayedComponents: .date)

                    DatePicker("End Date", selection: $viewModel.endDate, displayedComponents: .date)

                    TextField("Location (Optional)", text: $viewModel.location)
                }

                Section("Financial") {
                    HStack {
                        Text("Entry Fee")
                        Spacer()
                        TextField("$0.00", value: $viewModel.entryFee, format: .currency(code: "USD"))
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                    }

                    HStack {
                        Text("Per Diem")
                        Spacer()
                        TextField("$0.00", value: $viewModel.perDiem, format: .currency(code: "USD"))
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                    }

                    HStack {
                        Text("Budget")
                        Spacer()
                        TextField("$0.00", value: $viewModel.budget, format: .currency(code: "USD"))
                            .multilineTextAlignment(.trailing)
                            .keyboardType(.decimalPad)
                    }
                }

                Section("Hotel Information") {
                    TextField("Hotel Name (Optional)", text: $viewModel.hotelName)
                    TextField("Hotel Link (Optional)", text: $viewModel.hotelLink)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)

                    if !viewModel.hotelName.isEmpty {
                        DatePicker("Reservation Deadline", selection: $viewModel.hotelDeadline, displayedComponents: .date)
                    }
                }

                Section("Additional Details") {
                    TextField("Notes (Optional)", text: $viewModel.notes, axis: .vertical)
                        .lineLimit(3...6)

                    TextField("Itinerary (Optional)", text: $viewModel.itinerary, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("New Tournament")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.saveTournament()
                            if viewModel.saved {
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.isValid || viewModel.saving)
                }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK") {}
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }
}

@MainActor
class AddTournamentViewModel: ObservableObject {
    @Published var name = ""
    @Published var startDate = Date()
    @Published var endDate = Date().addingTimeInterval(86400 * 3) // 3 days later
    @Published var location = ""
    @Published var entryFee: Double? = nil
    @Published var hotelName = ""
    @Published var hotelLink = ""
    @Published var hotelDeadline = Date()
    @Published var perDiem: Double? = nil
    @Published var budget: Double? = nil
    @Published var notes = ""
    @Published var itinerary = ""

    @Published var saving = false
    @Published var saved = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let tournamentService = TournamentService()

    var isValid: Bool {
        !name.isEmpty && endDate >= startDate
    }

    func saveTournament() async {
        saving = true
        defer { saving = false }

        let request = CreateTournamentRequest(
            name: name,
            startDate: startDate,
            endDate: endDate,
            location: location.isEmpty ? nil : location,
            entryFee: entryFee,
            hotelName: hotelName.isEmpty ? nil : hotelName,
            hotelLink: hotelLink.isEmpty ? nil : hotelLink,
            hotelDeadline: hotelName.isEmpty ? nil : hotelDeadline,
            perDiem: perDiem,
            budget: budget,
            notes: notes.isEmpty ? nil : notes,
            itinerary: itinerary.isEmpty ? nil : itinerary
        )

        do {
            _ = try await tournamentService.createTournament(request)
            saved = true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

@MainActor
class TravelViewModel: ObservableObject {
    @Published var tournaments: [Tournament] = []
    @Published var events: [Event] = []
    @Published var showingAddTournament = false

    private let tournamentService = TournamentService()
    private let eventService = EventService()

    var upcomingTravelEvents: [Event] {
        let now = Date()
        return events
            .filter { $0.requiresTravel && $0.end >= now }
            .sorted { $0.start < $1.start }
    }

    var upcomingTournaments: [Tournament] {
        tournaments.filter { $0.endDate >= Date() }
    }

    var pastTournaments: [Tournament] {
        tournaments.filter { $0.endDate < Date() }
    }

    func loadData() async {
        await loadTournaments()
        await loadEvents()
    }

    func loadTournaments() async {
        do {
            tournaments = try await tournamentService.fetchTournaments()
        } catch {
            AppLogger.error("Failed to load tournaments: \(error.localizedDescription)", category: .general)
        }
    }

    func loadEvents() async {
        do {
            events = try await eventService.fetchEvents()
        } catch {
            AppLogger.error("Failed to load events: \(error.localizedDescription)", category: .general)
        }
    }
}

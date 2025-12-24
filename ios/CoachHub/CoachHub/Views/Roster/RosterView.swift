//
//  RosterView.swift
//  CoachHub
//

import SwiftUI

struct RosterView: View {
    @StateObject private var viewModel = RosterViewModel()

    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.players) { player in
                    NavigationLink(destination: PlayerDetailView(player: player)) {
                        PlayerRow(player: player)
                    }
                }
            }
            .navigationTitle("Roster")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.showingAddPlayer = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadPlayers()
            }
            .task {
                await viewModel.loadPlayers()
            }
            .sheet(isPresented: $viewModel.showingAddPlayer) {
                AddPlayerView()
            }
        }
    }
}

struct PlayerRow: View {
    let player: Player

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.blue.opacity(0.2))
                    .frame(width: 50, height: 50)

                Text("#\(player.jerseyNumber)")
                    .font(.headline)
                    .foregroundColor(.blue)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(player.fullName)
                    .font(.headline)

                Text(player.positionsDisplay)
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Text("Class of \(player.graduationYear)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if !player.active {
                Text("Inactive")
                    .font(.caption)
                    .foregroundColor(.red)
            }
        }
        .padding(.vertical, 4)
    }
}

struct PlayerDetailView: View {
    let player: Player

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Header
                ZStack {
                    Circle()
                        .fill(Color.blue.opacity(0.2))
                        .frame(width: 100, height: 100)

                    Text("#\(player.jerseyNumber)")
                        .font(.largeTitle.bold())
                        .foregroundColor(.blue)
                }

                Text(player.fullName)
                    .font(.title.bold())

                // Basic Info Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Player Info")
                        .font(.headline)
                        .padding(.bottom, 4)

                    InfoRow(label: "Positions", value: player.positionsDisplay)
                    InfoRow(label: "Bats/Throws", value: "\(player.bats)/\(player.throws)")

                    if let birthYear = player.birthYear {
                        InfoRow(label: "Birth Year", value: "\(birthYear)")
                    }

                    InfoRow(label: "Class", value: "\(player.graduationYear)")

                    if let age = player.age {
                        InfoRow(label: "Age", value: "\(age)")
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)

                // Performance Metrics Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Performance Metrics")
                        .font(.headline)
                        .padding(.bottom, 4)

                    if let exitVelo = player.latestExitVelocity {
                        MetricRow(label: "Exit Velocity", value: String(format: "%.1f", exitVelo), unit: "mph")
                    } else {
                        MetricRow(label: "Exit Velocity", value: "-", unit: "mph")
                    }

                    if let pulldownVelo = player.latestPulldownVelocity {
                        MetricRow(label: "Pulldown Velocity", value: String(format: "%.1f", pulldownVelo), unit: "mph")
                    } else {
                        MetricRow(label: "Pulldown Velocity", value: "-", unit: "mph")
                    }

                    if let sprint = player.latestSixtyYardSprint {
                        MetricRow(label: "60 Yard Sprint", value: String(format: "%.2f", sprint), unit: "sec")
                    } else {
                        MetricRow(label: "60 Yard Sprint", value: "-", unit: "sec")
                    }
                }
                .padding()
                .background(Color.green.opacity(0.1))
                .cornerRadius(12)

                // Parent Info Section
                if player.parentName != nil || player.parentPhone != nil || player.parentEmail != nil {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Parent/Guardian")
                            .font(.headline)
                            .padding(.bottom, 4)

                        if let parentName = player.parentName {
                            InfoRow(label: "Name", value: parentName)
                        }

                        if let parentPhone = player.parentPhone {
                            InfoRow(label: "Phone", value: parentPhone)
                        }

                        if let parentEmail = player.parentEmail {
                            InfoRow(label: "Email", value: parentEmail)
                        }
                    }
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(12)
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct MetricRow: View {
    let label: String
    let value: String
    let unit: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundColor(.secondary)
            Spacer()
            HStack(spacing: 4) {
                Text(value)
                    .bold()
                Text(unit)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
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

struct AddPlayerView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = AddPlayerViewModel()

    var body: some View {
        NavigationView {
            Form {
                Section("Basic Info") {
                    TextField("First Name", text: $viewModel.firstName)
                    TextField("Last Name", text: $viewModel.lastName)

                    HStack {
                        Text("Jersey Number")
                        Spacer()
                        TextField("0", text: $viewModel.jerseyNumberText)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                    }
                }

                Section("Positions") {
                    ForEach(["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "UTIL"], id: \.self) { position in
                        Toggle(position, isOn: Binding(
                            get: { viewModel.positions.contains(position) },
                            set: { isOn in
                                if isOn {
                                    viewModel.positions.append(position)
                                } else {
                                    viewModel.positions.removeAll { $0 == position }
                                }
                            }
                        ))
                    }
                }

                Section("Hitting & Throwing") {
                    Picker("Bats", selection: $viewModel.bats) {
                        Text("Right").tag("R")
                        Text("Left").tag("L")
                        Text("Switch").tag("S")
                    }
                    .pickerStyle(.segmented)

                    Picker("Throws", selection: $viewModel.throws) {
                        Text("Right").tag("R")
                        Text("Left").tag("L")
                    }
                    .pickerStyle(.segmented)
                }

                Section("Academic Info") {
                    DatePicker("Birth Date", selection: $viewModel.birthDate, displayedComponents: .date)
                        .onChange(of: viewModel.birthDate) { _, newValue in
                            viewModel.updateGraduationYear(from: newValue)
                        }

                    HStack {
                        Text("Birth Year")
                        Spacer()
                        Text("\(viewModel.birthYear)")
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("Graduation Year")
                        Spacer()
                        Text("\(viewModel.graduationYear)")
                            .foregroundColor(.secondary)
                    }

                    Text("Graduation year is automatically calculated based on birth date")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Section("Performance Metrics (Optional)") {
                    HStack {
                        Text("Exit Velocity")
                        Spacer()
                        TextField("", text: $viewModel.exitVelocityText)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("mph")
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("Pulldown Velocity")
                        Spacer()
                        TextField("", text: $viewModel.pulldownVelocityText)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("mph")
                            .foregroundColor(.secondary)
                    }

                    HStack {
                        Text("60 Yard Sprint")
                        Spacer()
                        TextField("", text: $viewModel.sixtyYardSprintText)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("sec")
                            .foregroundColor(.secondary)
                    }
                }

                Section("Parent/Guardian Info") {
                    TextField("Parent Name (Optional)", text: $viewModel.parentName)
                    TextField("Parent Phone (Optional)", text: $viewModel.parentPhone)
                        .keyboardType(.phonePad)
                    TextField("Parent Email (Optional)", text: $viewModel.parentEmail)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }
            }
            .navigationTitle("New Player")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.savePlayer()
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
class AddPlayerViewModel: ObservableObject {
    @Published var firstName = ""
    @Published var lastName = ""
    @Published var jerseyNumberText = ""
    @Published var positions: [String] = []
    @Published var bats = "R"
    @Published var `throws` = "R"
    @Published var graduationYear = Calendar.current.component(.year, from: Date()) + 4
    @Published var birthDate = Calendar.current.date(byAdding: .year, value: -14, to: Date()) ?? Date()
    @Published var parentName = ""
    @Published var parentPhone = ""
    @Published var parentEmail = ""

    // Performance metrics
    @Published var exitVelocityText = ""
    @Published var pulldownVelocityText = ""
    @Published var sixtyYardSprintText = ""

    @Published var saving = false
    @Published var saved = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let playerService = PlayerService()

    var jerseyNumber: Int {
        Int(jerseyNumberText) ?? 0
    }

    var birthYear: Int {
        Calendar.current.component(.year, from: birthDate)
    }

    var exitVelocity: Double? {
        Double(exitVelocityText)
    }

    var pulldownVelocity: Double? {
        Double(pulldownVelocityText)
    }

    var sixtyYardSprint: Double? {
        Double(sixtyYardSprintText)
    }

    var isValid: Bool {
        !firstName.isEmpty && !lastName.isEmpty && !positions.isEmpty
    }

    /// Calculate graduation year from birth date
    /// Standard calculation: A player graduates high school in the spring of the year they turn 18
    /// Birth year + 18 = graduation year (approximately)
    /// More precise: If born Aug-Dec, they graduate in birthYear + 18
    /// If born Jan-Jul, they graduate in birthYear + 18
    func updateGraduationYear(from birthDate: Date) {
        let calendar = Calendar.current
        let birthYear = calendar.component(.year, from: birthDate)
        let birthMonth = calendar.component(.month, from: birthDate)

        // Baseball cutoff is typically May 1 for age groups
        // Players born before May 1 are in the "older" grade for their birth year
        // Players born May 1 or later are in the "younger" grade
        // High school graduation is typically at age 17-18

        if birthMonth >= 5 {
            // Born May-December: Graduate in birthYear + 18
            graduationYear = birthYear + 18
        } else {
            // Born January-April: Graduate in birthYear + 18 (same year, just earlier)
            graduationYear = birthYear + 18
        }
    }

    func savePlayer() async {
        saving = true
        defer { saving = false }

        let request = CreatePlayerRequest(
            firstName: firstName,
            lastName: lastName,
            jerseyNumber: jerseyNumber,
            photo: nil,
            positions: positions,
            bats: bats,
            throws: `throws`,
            graduationYear: graduationYear,
            birthDate: birthDate,
            parentName: parentName.isEmpty ? nil : parentName,
            parentPhone: parentPhone.isEmpty ? nil : parentPhone,
            parentEmail: parentEmail.isEmpty ? nil : parentEmail
        )

        do {
            let player = try await playerService.createPlayer(request)

            // Save performance metrics if provided
            if let exitVelo = exitVelocity {
                _ = try await playerService.addPerformanceMetric(
                    playerId: player.id,
                    type: "EXIT_VELOCITY",
                    value: exitVelo
                )
            }

            if let pulldownVelo = pulldownVelocity {
                _ = try await playerService.addPerformanceMetric(
                    playerId: player.id,
                    type: "PULLDOWN_VELOCITY",
                    value: pulldownVelo
                )
            }

            if let sprint = sixtyYardSprint {
                _ = try await playerService.addPerformanceMetric(
                    playerId: player.id,
                    type: "SIXTY_YARD_SPRINT",
                    value: sprint
                )
            }

            saved = true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

@MainActor
class RosterViewModel: ObservableObject {
    @Published var players: [Player] = []
    @Published var showingAddPlayer = false

    private let playerService = PlayerService()

    func loadPlayers() async {
        do {
            players = try await playerService.fetchPlayers()
        } catch {
            AppLogger.error("Failed to load players: \(error.localizedDescription)", category: .general)
        }
    }
}

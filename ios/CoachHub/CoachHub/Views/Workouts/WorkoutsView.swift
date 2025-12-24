//
//  WorkoutsView.swift
//  CoachHub
//

import SwiftUI

struct WorkoutsView: View {
    @StateObject private var viewModel = WorkoutsViewModel()

    var body: some View {
        NavigationView {
            List {
                ForEach(viewModel.workouts) { workout in
                    NavigationLink(destination: WorkoutDetailView(workout: workout)) {
                        WorkoutRow(workout: workout)
                    }
                }
            }
            .navigationTitle("Workouts")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.showingAddWorkout = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .refreshable {
                await viewModel.loadWorkouts()
            }
            .task {
                await viewModel.loadWorkouts()
            }
            .sheet(isPresented: $viewModel.showingAddWorkout) {
                AddWorkoutView()
            }
        }
    }
}

struct WorkoutRow: View {
    let workout: Workout

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(workout.title)
                    .font(.headline)

                Spacer()

                if workout.active {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                }
            }

            HStack {
                Image(systemName: "clock")
                Text(workout.durationDisplay)

                Text("•")
                    .foregroundColor(.secondary)

                Text(workout.frequency.displayName)
            }
            .font(.subheadline)
            .foregroundColor(.secondary)

            HStack {
                ForEach(workout.focus.prefix(3), id: \.self) { focus in
                    Image(systemName: focus.icon)
                        .foregroundColor(.blue)
                }

                if workout.focus.count > 3 {
                    Text("+\(workout.focus.count - 3)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct WorkoutDetailView: View {
    let workout: Workout

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text(workout.title)
                    .font(.title.bold())

                VStack(alignment: .leading, spacing: 12) {
                    InfoRow(label: "Duration", value: workout.durationDisplay)
                    InfoRow(label: "Frequency", value: workout.frequency.displayName)
                    InfoRow(label: "Age Range", value: workout.ageRangeDisplay)
                }

                VStack(alignment: .leading, spacing: 8) {
                    Text("Focus Areas")
                        .font(.headline)

                    FlowLayout(spacing: 8) {
                        ForEach(workout.focus, id: \.self) { focus in
                            HStack {
                                Image(systemName: focus.icon)
                                Text(focus.displayName)
                            }
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.blue.opacity(0.1))
                            .foregroundColor(.blue)
                            .cornerRadius(16)
                        }
                    }
                }

                if let description = workout.description {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Description")
                            .font(.headline)
                        Text(description)
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

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        let height = rows.reduce(0) { $0 + $1.maxHeight + spacing } - spacing
        return CGSize(width: proposal.width ?? 0, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let rows = computeRows(proposal: proposal, subviews: subviews)
        var y = bounds.minY

        for row in rows {
            var x = bounds.minX
            for index in row.indices {
                let size = subviews[index].sizeThatFits(.unspecified)
                subviews[index].place(at: CGPoint(x: x, y: y), proposal: .unspecified)
                x += size.width + spacing
            }
            y += row.maxHeight + spacing
        }
    }

    private func computeRows(proposal: ProposedViewSize, subviews: Subviews) -> [(indices: Range<Int>, maxHeight: CGFloat)] {
        var rows: [(indices: Range<Int>, maxHeight: CGFloat)] = []
        var currentRow: Range<Int> = 0..<0
        var currentX: CGFloat = 0
        var currentMaxHeight: CGFloat = 0

        for (index, subview) in subviews.enumerated() {
            let size = subview.sizeThatFits(.unspecified)

            if currentX + size.width > (proposal.width ?? .infinity) && !currentRow.isEmpty {
                rows.append((currentRow, currentMaxHeight))
                currentRow = index..<index
                currentX = 0
                currentMaxHeight = 0
            }

            currentX += size.width + spacing
            currentMaxHeight = max(currentMaxHeight, size.height)
            currentRow = currentRow.lowerBound..<(index + 1)
        }

        if !currentRow.isEmpty {
            rows.append((currentRow, currentMaxHeight))
        }

        return rows
    }
}

struct AddWorkoutView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = AddWorkoutViewModel()

    var body: some View {
        NavigationView {
            Form {
                Section("Workout Details") {
                    TextField("Title", text: $viewModel.title)

                    Picker("Frequency", selection: $viewModel.frequency) {
                        ForEach([WorkoutFrequency.DAILY, .EVERY_OTHER_DAY, .TWICE_WEEKLY, .WEEKLY, .BIWEEKLY, .MONTHLY], id: \.self) { freq in
                            Text(freq.displayName).tag(freq)
                        }
                    }

                    Stepper("Duration: \(viewModel.duration) min", value: $viewModel.duration, in: 15...180, step: 15)
                }

                Section("Age Range") {
                    Toggle("Set Age Range", isOn: $viewModel.hasAgeRange)

                    if viewModel.hasAgeRange {
                        Stepper("Min Age: \(viewModel.ageMin)", value: $viewModel.ageMin, in: 5...18)
                        Stepper("Max Age: \(viewModel.ageMax)", value: $viewModel.ageMax, in: 5...18)
                    }
                }

                Section("Focus Areas") {
                    ForEach([WorkoutFocus.HITTING, .PITCHING, .FIELDING, .BASE_RUNNING, .CONDITIONING, .STRENGTH, .AGILITY, .MENTAL, .TEAM_BUILDING], id: \.self) { focus in
                        Toggle(isOn: Binding(
                            get: { viewModel.focusAreas.contains(focus) },
                            set: { isOn in
                                if isOn {
                                    viewModel.focusAreas.append(focus)
                                } else {
                                    viewModel.focusAreas.removeAll { $0 == focus }
                                }
                            }
                        )) {
                            HStack {
                                Image(systemName: focus.icon)
                                Text(focus.displayName)
                            }
                        }
                    }
                }

                Section("Program Duration") {
                    Toggle("Set Program Duration", isOn: $viewModel.hasProgramDuration)

                    if viewModel.hasProgramDuration {
                        Stepper("Duration: \(viewModel.programDuration)", value: $viewModel.programDuration, in: 1...52)

                        Picker("Unit", selection: $viewModel.programDurationUnit) {
                            Text("Weeks").tag("weeks")
                            Text("Months").tag("months")
                        }
                        .pickerStyle(.segmented)
                    }
                }

                Section("Description") {
                    TextField("Description (Optional)", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                }
            }
            .navigationTitle("New Workout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.saveWorkout()
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
class AddWorkoutViewModel: ObservableObject {
    @Published var title = ""
    @Published var frequency: WorkoutFrequency = .TWICE_WEEKLY
    @Published var duration = 60
    @Published var hasAgeRange = false
    @Published var ageMin = 10
    @Published var ageMax = 14
    @Published var focusAreas: [WorkoutFocus] = []
    @Published var hasProgramDuration = false
    @Published var programDuration = 4
    @Published var programDurationUnit = "weeks"
    @Published var description = ""

    @Published var saving = false
    @Published var saved = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let workoutService = WorkoutService()

    var isValid: Bool {
        !title.isEmpty && !focusAreas.isEmpty && (!hasAgeRange || ageMax >= ageMin)
    }

    func saveWorkout() async {
        saving = true
        defer { saving = false }

        let request = CreateWorkoutRequest(
            title: title,
            frequency: frequency,
            ageMin: hasAgeRange ? ageMin : nil,
            ageMax: hasAgeRange ? ageMax : nil,
            duration: duration,
            programDuration: hasProgramDuration ? programDuration : nil,
            programDurationUnit: hasProgramDuration ? programDurationUnit : nil,
            focus: focusAreas,
            description: description.isEmpty ? nil : description
        )

        do {
            _ = try await workoutService.createWorkout(request)
            saved = true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

@MainActor
class WorkoutsViewModel: ObservableObject {
    @Published var workouts: [Workout] = []
    @Published var showingAddWorkout = false

    private let workoutService = WorkoutService()

    func loadWorkouts() async {
        do {
            workouts = try await workoutService.fetchWorkouts()
        } catch {
            AppLogger.error("Failed to load workouts: \(error.localizedDescription)", category: .general)
        }
    }
}

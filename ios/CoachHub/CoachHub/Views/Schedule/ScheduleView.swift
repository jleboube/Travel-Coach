//
//  ScheduleView.swift
//  CoachHub
//
//  Professional schedule view with calendar and list integration
//

import SwiftUI

struct ScheduleView: View {
    @StateObject private var viewModel = ScheduleViewModel()
    @State private var selectedDate = Date()

    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    // Calendar View
                    CalendarView(selectedDate: $selectedDate, events: viewModel.events)
                        .padding(.horizontal)

                    // Upcoming Events Section
                    if !upcomingEvents.isEmpty {
                        upcomingEventsSection
                            .padding(.horizontal)
                    }

                    // Events for Selected Date
                    if !eventsForSelectedDate.isEmpty {
                        eventsForSelectedDateSection
                            .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Schedule")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        viewModel.showingAddEvent = true
                    } label: {
                        Label("Add Event", systemImage: "plus.circle.fill")
                            .font(.system(size: 20))
                    }
                }
            }
            .refreshable {
                await viewModel.loadEvents()
            }
            .task {
                await viewModel.loadEvents()
            }
            .sheet(isPresented: $viewModel.showingAddEvent) {
                AddEventView()
            }
        }
    }

    private var upcomingEventsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Upcoming Events")
                .font(.title2.bold())
                .padding(.horizontal, 4)

            VStack(spacing: 12) {
                ForEach(upcomingEvents) { event in
                    NavigationLink(destination: EventDetailView(event: event, onRefresh: { await viewModel.loadEvents() })) {
                        EventRow(event: event)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(16)
        }
    }

    private var eventsForSelectedDateSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Events on \(selectedDateString)")
                .font(.title3.bold())
                .padding(.horizontal, 4)

            VStack(spacing: 12) {
                ForEach(eventsForSelectedDate) { event in
                    NavigationLink(destination: EventDetailView(event: event, onRefresh: { await viewModel.loadEvents() })) {
                        EventRow(event: event)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()
            .background(Color(.secondarySystemBackground))
            .cornerRadius(16)
        }
    }

    private var selectedDateString: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter.string(from: selectedDate)
    }

    private var upcomingEvents: [Event] {
        let now = Date()
        return viewModel.events
            .filter { $0.end >= now }
            .sorted { $0.start < $1.start }
            .prefix(5)
            .map { $0 }
    }

    private var eventsForSelectedDate: [Event] {
        let calendar = Calendar.current
        return viewModel.events
            .filter { calendar.isDate($0.start, inSameDayAs: selectedDate) }
            .sorted { $0.start < $1.start }
    }
}

// MARK: - Calendar View

struct CalendarView: View {
    @Binding var selectedDate: Date
    let events: [Event]

    @State private var currentMonth = Date()

    private let calendar = Calendar.current
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 0), count: 7)

    private var monthYearString: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: currentMonth)
    }

    private var daysInMonth: [Date?] {
        var days: [Date?] = []

        guard let monthInterval = calendar.dateInterval(of: .month, for: currentMonth),
              let monthFirstWeek = calendar.dateInterval(of: .weekOfMonth, for: monthInterval.start) else {
            return days
        }

        var currentDate = monthFirstWeek.start

        while days.count < 42 { // 6 weeks max
            days.append(currentDate)
            currentDate = calendar.date(byAdding: .day, value: 1, to: currentDate)!
        }

        return days
    }

    private func hasEvents(on date: Date) -> Bool {
        events.contains { calendar.isDate($0.start, inSameDayAs: date) }
    }

    var body: some View {
        VStack(spacing: 16) {
            // Month/Year Header with navigation
            HStack {
                Button {
                    changeMonth(by: -1)
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.title3)
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                }

                Spacer()

                Text(monthYearString)
                    .font(.title2.bold())

                Spacer()

                Button {
                    changeMonth(by: 1)
                } label: {
                    Image(systemName: "chevron.right")
                        .font(.title3)
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                }
            }
            .padding(.horizontal, 8)

            // Weekday headers
            HStack(spacing: 0) {
                ForEach(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], id: \.self) { day in
                    Text(day)
                        .font(.caption.bold())
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity)
                }
            }

            // Calendar grid
            LazyVGrid(columns: columns, spacing: 8) {
                ForEach(daysInMonth.indices, id: \.self) { index in
                    if let date = daysInMonth[index] {
                        DayCell(
                            date: date,
                            isSelected: calendar.isDate(date, inSameDayAs: selectedDate),
                            isToday: calendar.isDateInToday(date),
                            isCurrentMonth: calendar.isDate(date, equalTo: currentMonth, toGranularity: .month),
                            hasEvents: hasEvents(on: date)
                        ) {
                            selectedDate = date
                        }
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(16)
    }

    private func changeMonth(by value: Int) {
        if let newMonth = calendar.date(byAdding: .month, value: value, to: currentMonth) {
            currentMonth = newMonth
        }
    }
}

// MARK: - Day Cell

struct DayCell: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let isCurrentMonth: Bool
    let hasEvents: Bool
    let action: () -> Void

    private var dayNumber: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter.string(from: date)
    }

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Text(dayNumber)
                    .font(.system(size: 16, weight: isSelected || isToday ? .bold : .regular))
                    .foregroundColor(textColor)

                if hasEvents {
                    Circle()
                        .fill(isSelected ? Color.white : Color.blue)
                        .frame(width: 4, height: 4)
                } else {
                    Circle()
                        .fill(Color.clear)
                        .frame(width: 4, height: 4)
                }
            }
            .frame(height: 44)
            .frame(maxWidth: .infinity)
            .background(backgroundColor)
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isToday && !isSelected ? Color.blue : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    private var textColor: Color {
        if !isCurrentMonth {
            return Color.gray.opacity(0.4)
        }
        if isSelected {
            return .white
        }
        return .primary
    }

    private var backgroundColor: Color {
        if isSelected {
            return Color.blue
        }
        return Color.clear
    }
}

// MARK: - Event Row

struct EventRow: View {
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

            // Indicators
            VStack(alignment: .trailing, spacing: 4) {
                if event.requiresTravel {
                    Image(systemName: "airplane.circle.fill")
                        .font(.title3)
                        .foregroundColor(.orange)
                }

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
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

// MARK: - Event Detail View

struct EventDetailView: View {
    let event: Event
    var onRefresh: (() async -> Void)? = nil
    @Environment(\.dismiss) var dismiss
    @State private var showingEditEvent = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text(event.title)
                        .font(.largeTitle.bold())

                    HStack {
                        Image(systemName: event.type.icon)
                        Text(event.type.displayName)
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                }

                Divider()

                // Date & Time
                DetailRow(
                    icon: "calendar",
                    title: "Date & Time",
                    value: event.displayTime
                )

                // Location
                if let location = event.location {
                    DetailRow(
                        icon: "mappin.circle.fill",
                        title: "Location",
                        value: location
                    )
                }

                // Opponent (for games)
                if let opponent = event.opponent {
                    DetailRow(
                        icon: "sportscourt",
                        title: "Opponent",
                        value: opponent
                    )
                }

                // Description
                if let description = event.description, !description.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Description", systemImage: "doc.text")
                            .font(.headline)

                        Text(description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(12)
                }

                // Travel indicator
                if event.requiresTravel {
                    HStack {
                        Image(systemName: "airplane.circle.fill")
                            .foregroundColor(.orange)
                        Text("Travel required")
                            .font(.subheadline)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.orange.opacity(0.1))
                    .cornerRadius(12)
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showingEditEvent = true
                } label: {
                    Text("Edit")
                }
            }
        }
        .sheet(isPresented: $showingEditEvent) {
            EditEventView(event: event, onRefresh: onRefresh)
        }
    }
}

struct DetailRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.blue)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text(value)
                    .font(.body)
            }

            Spacer()
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}

// MARK: - Add Event View

struct AddEventView: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = AddEventViewModel()

    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Event Title", text: $viewModel.title)
                        .font(.body)

                    Picker("Type", selection: $viewModel.type) {
                        ForEach([EventType.PRACTICE, .GAME, .TOURNAMENT, .TEAM_MEETING, .FUNDRAISER, .OFF_DAY, .INDIVIDUAL_LESSON], id: \.self) { type in
                            Label(type.displayName, systemImage: type.icon)
                                .tag(type)
                        }
                    }
                } header: {
                    Text("Event Details")
                }

                Section {
                    Toggle("All Day Event", isOn: $viewModel.allDay)

                    DatePicker(
                        "Start",
                        selection: $viewModel.start,
                        displayedComponents: viewModel.allDay ? [.date] : [.date, .hourAndMinute]
                    )

                    DatePicker(
                        "End",
                        selection: $viewModel.end,
                        displayedComponents: viewModel.allDay ? [.date] : [.date, .hourAndMinute]
                    )
                } header: {
                    Text("Date & Time")
                }

                Section {
                    TextField("Location", text: $viewModel.location)

                    TextField("Location URL (Optional)", text: $viewModel.locationUrl)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                } header: {
                    Text("Location")
                }

                if viewModel.type == .GAME || viewModel.type == .TOURNAMENT {
                    Section {
                        TextField("Opponent", text: $viewModel.opponent)

                        Picker("Governing Body", selection: $viewModel.governingBody) {
                            Text("Not Applicable").tag(GoverningBody?.none)
                            Text("PBR").tag(GoverningBody?.some(.PBR))
                            Text("USSSA").tag(GoverningBody?.some(.USSSA))
                            Text("JP Sports").tag(GoverningBody?.some(.JP_SPORTS))
                            Text("Perfect Game").tag(GoverningBody?.some(.PG))
                            Text("GameDay").tag(GoverningBody?.some(.GAMEDAY))
                        }
                    } header: {
                        Text("Game Details")
                    }
                }

                Section {
                    Toggle("Requires Travel", isOn: $viewModel.requiresTravel)

                    TextField("Description (Optional)", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                } header: {
                    Text("Additional Details")
                }
            }
            .navigationTitle("New Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.saveEvent()
                            if viewModel.saved {
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.isValid || viewModel.saving)
                    .bold()
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

struct EditEventView: View {
    let event: Event
    var onRefresh: (() async -> Void)? = nil
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel: EditEventViewModel

    init(event: Event, onRefresh: (() async -> Void)? = nil) {
        self.event = event
        self.onRefresh = onRefresh
        _viewModel = StateObject(wrappedValue: EditEventViewModel(event: event))
    }

    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Event Title", text: $viewModel.title)
                        .font(.body)

                    Picker("Type", selection: $viewModel.type) {
                        ForEach([EventType.PRACTICE, .GAME, .TOURNAMENT, .TEAM_MEETING, .FUNDRAISER, .OFF_DAY, .INDIVIDUAL_LESSON], id: \.self) { type in
                            Label(type.displayName, systemImage: type.icon)
                                .tag(type)
                        }
                    }
                } header: {
                    Text("Event Details")
                }

                Section {
                    Toggle("All Day Event", isOn: $viewModel.allDay)

                    DatePicker(
                        "Start",
                        selection: $viewModel.start,
                        displayedComponents: viewModel.allDay ? [.date] : [.date, .hourAndMinute]
                    )

                    DatePicker(
                        "End",
                        selection: $viewModel.end,
                        displayedComponents: viewModel.allDay ? [.date] : [.date, .hourAndMinute]
                    )
                } header: {
                    Text("Date & Time")
                }

                Section {
                    TextField("Location", text: $viewModel.location)

                    TextField("Location URL (Optional)", text: $viewModel.locationUrl)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                } header: {
                    Text("Location")
                }

                if viewModel.type == .GAME || viewModel.type == .TOURNAMENT {
                    Section {
                        TextField("Opponent", text: $viewModel.opponent)

                        Picker("Governing Body", selection: $viewModel.governingBody) {
                            Text("Not Applicable").tag(GoverningBody?.none)
                            Text("PBR").tag(GoverningBody?.some(.PBR))
                            Text("USSSA").tag(GoverningBody?.some(.USSSA))
                            Text("JP Sports").tag(GoverningBody?.some(.JP_SPORTS))
                            Text("Perfect Game").tag(GoverningBody?.some(.PG))
                            Text("GameDay").tag(GoverningBody?.some(.GAMEDAY))
                        }
                    } header: {
                        Text("Game Details")
                    }
                }

                Section {
                    Toggle("Requires Travel", isOn: $viewModel.requiresTravel)

                    TextField("Description (Optional)", text: $viewModel.description, axis: .vertical)
                        .lineLimit(3...6)
                } header: {
                    Text("Additional Details")
                }
            }
            .navigationTitle("Edit Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await viewModel.updateEvent()
                            if viewModel.saved {
                                await onRefresh?()
                                dismiss()
                            }
                        }
                    }
                    .disabled(!viewModel.isValid || viewModel.saving)
                    .bold()
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

// MARK: - View Models

@MainActor
class AddEventViewModel: ObservableObject {
    @Published var title = ""
    @Published var type: EventType = .PRACTICE
    @Published var start = Date()
    @Published var end = Date().addingTimeInterval(3600)
    @Published var allDay = false
    @Published var location = ""
    @Published var locationUrl = ""
    @Published var description = ""
    @Published var opponent = ""
    @Published var governingBody: GoverningBody? = nil
    @Published var requiresTravel = false

    @Published var saving = false
    @Published var saved = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let eventService = EventService()

    var isValid: Bool {
        !title.isEmpty && !location.isEmpty && end > start
    }

    func saveEvent() async {
        saving = true
        defer { saving = false }

        let request = CreateEventRequest(
            title: title,
            type: type,
            start: start,
            end: end,
            allDay: allDay,
            location: location.isEmpty ? nil : location,
            locationUrl: locationUrl.isEmpty ? nil : locationUrl,
            description: description.isEmpty ? nil : description,
            opponent: opponent.isEmpty ? nil : opponent,
            governingBody: governingBody,
            requiresTravel: requiresTravel
        )

        do {
            _ = try await eventService.createEvent(request)
            saved = true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

@MainActor
class EditEventViewModel: ObservableObject {
    let eventId: String

    @Published var title: String
    @Published var type: EventType
    @Published var start: Date
    @Published var end: Date
    @Published var allDay: Bool
    @Published var location: String
    @Published var locationUrl: String
    @Published var description: String
    @Published var opponent: String
    @Published var governingBody: GoverningBody?
    @Published var requiresTravel: Bool

    @Published var saving = false
    @Published var saved = false
    @Published var showError = false
    @Published var errorMessage = ""

    private let eventService = EventService()

    init(event: Event) {
        self.eventId = event.id
        self.title = event.title
        self.type = event.type
        self.start = event.start
        self.end = event.end
        self.allDay = event.allDay
        self.location = event.location ?? ""
        self.locationUrl = event.locationUrl ?? ""
        self.description = event.description ?? ""
        self.opponent = event.opponent ?? ""
        self.governingBody = event.governingBody
        self.requiresTravel = event.requiresTravel
    }

    var isValid: Bool {
        !title.isEmpty && !location.isEmpty && end > start
    }

    func updateEvent() async {
        saving = true
        defer { saving = false }

        let request = CreateEventRequest(
            title: title,
            type: type,
            start: start,
            end: end,
            allDay: allDay,
            location: location.isEmpty ? nil : location,
            locationUrl: locationUrl.isEmpty ? nil : locationUrl,
            description: description.isEmpty ? nil : description,
            opponent: opponent.isEmpty ? nil : opponent,
            governingBody: governingBody,
            requiresTravel: requiresTravel
        )

        do {
            _ = try await eventService.updateEvent(id: eventId, request)
            saved = true
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

@MainActor
class ScheduleViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var showingAddEvent = false

    private let eventService = EventService()

    func loadEvents() async {
        do {
            events = try await eventService.fetchEvents()
        } catch {
            AppLogger.error("Failed to load events: \(error.localizedDescription)", category: .general)
        }
    }
}

#Preview {
    ScheduleView()
}

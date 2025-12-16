# CoachHub iOS Native App - Architecture Document

## Overview

This document outlines the architecture for the native iOS app that will replace the PWA. The app is built using SwiftUI and follows Apple's best practices for iOS development.

## Tech Stack

- **UI Framework**: SwiftUI (iOS 15+)
- **Networking**: URLSession with async/await
- **Authentication**: JWT tokens stored in Keychain
- **Data Persistence**: UserDefaults for preferences, Keychain for sensitive data
- **Architecture**: MVVM (Model-View-ViewModel)
- **Minimum iOS Version**: iOS 15.0

## Project Structure

```
CoachHub/
├── Models/                 # Data models matching backend schema
│   ├── User.swift
│   ├── Player.swift
│   ├── Event.swift
│   ├── Tournament.swift
│   ├── Workout.swift
│   └── ... (other models)
├── ViewModels/            # Business logic and state management
│   ├── AuthViewModel.swift
│   ├── DashboardViewModel.swift
│   ├── ScheduleViewModel.swift
│   ├── RosterViewModel.swift
│   ├── TravelViewModel.swift
│   └── WorkoutsViewModel.swift
├── Views/                 # SwiftUI views
│   ├── Auth/
│   │   ├── LoginView.swift
│   │   └── RegisterView.swift
│   ├── Dashboard/
│   │   └── DashboardView.swift
│   ├── Schedule/
│   │   ├── ScheduleView.swift
│   │   └── EventDetailView.swift
│   ├── Roster/
│   │   ├── RosterView.swift
│   │   └── PlayerDetailView.swift
│   ├── Travel/
│   │   ├── TravelView.swift
│   │   └── TournamentDetailView.swift
│   └── Workouts/
│       ├── WorkoutsView.swift
│       └── WorkoutDetailView.swift
├── Services/              # API and business logic services
│   ├── APIClient.swift    # Base networking client
│   ├── AuthService.swift  # Authentication
│   ├── EventService.swift # Events/Schedule API
│   ├── PlayerService.swift # Players/Roster API
│   ├── TournamentService.swift # Tournaments API
│   └── WorkoutService.swift # Workouts API
├── Utilities/             # Helper utilities
│   ├── KeychainManager.swift
│   ├── DateFormatter+Extensions.swift
│   └── Color+Extensions.swift
├── Config.swift           # App configuration
└── CoachHubApp.swift     # App entry point
```

## Data Models

### Core Models

All models conform to `Codable` for JSON serialization and `Identifiable` for SwiftUI.

**User Model**:
```swift
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let role: UserRole
    let image: String?
    let createdAt: Date
    let updatedAt: Date
}

enum UserRole: String, Codable {
    case HEAD_COACH
    case ASSISTANT_COACH
    case TEAM_MANAGER
    case PARENT
    case PLAYER
}
```

**Event Model**:
```swift
struct Event: Codable, Identifiable {
    let id: String
    let title: String
    let type: EventType
    let start: Date
    let end: Date
    let allDay: Bool
    let location: String?
    let locationUrl: String?
    let description: String?
    let opponent: String?
    let requiresTravel: Bool
    let rsvps: [RSVP]?
}

enum EventType: String, Codable {
    case PRACTICE, GAME, TOURNAMENT, TEAM_MEETING
    case FUNDRAISER, OFF_DAY, INDIVIDUAL_LESSON
}
```

**Player Model**:
```swift
struct Player: Codable, Identifiable {
    let id: String
    let firstName: String
    let lastName: String
    let jerseyNumber: Int
    let photo: String?
    let positions: [String]
    let bats: String
    let throws: String
    let graduationYear: Int
    let birthDate: Date?
    let parentName: String?
    let parentPhone: String?
    let parentEmail: String?
    let active: Bool
}
```

## Networking Layer

### APIClient

Base client handling all HTTP requests:

```swift
class APIClient {
    static let shared = APIClient()

    private let baseURL = Config.apiBaseURL
    private var authToken: String?

    // Methods:
    // - request<T: Decodable>(...) -> T
    // - get<T: Decodable>(...) -> T
    // - post<T: Decodable>(...) -> T
    // - put<T: Decodable>(...) -> T
    // - delete(...) -> Void
}
```

### Service Layer

Each feature has a dedicated service:

```swift
class EventService {
    func fetchEvents() async throws -> [Event]
    func createEvent(_ event: Event) async throws -> Event
    func updateEvent(_ event: Event) async throws -> Event
    func deleteEvent(id: String) async throws
}
```

## Authentication Flow

### JWT Token-Based Authentication

1. User logs in with email/password
2. Backend returns JWT token
3. iOS app stores token in Keychain
4. All API requests include token in Authorization header
5. On token expiry, redirect to login

### KeychainManager

Secure storage for sensitive data:

```swift
class KeychainManager {
    static let shared = KeychainManager()

    func save(token: String)
    func getToken() -> String?
    func deleteToken()
}
```

## View Architecture (MVVM)

### ViewModel Pattern

Each major view has a ViewModel that:
- Manages state with `@Published` properties
- Handles business logic
- Communicates with services
- Provides data to views

Example:
```swift
class ScheduleViewModel: ObservableObject {
    @Published var events: [Event] = []
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let eventService = EventService()

    func fetchEvents() async {
        isLoading = true
        do {
            events = try await eventService.fetchEvents()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }
}
```

### View Pattern

Views observe ViewModels and react to state changes:

```swift
struct ScheduleView: View {
    @StateObject private var viewModel = ScheduleViewModel()

    var body: some View {
        List(viewModel.events) { event in
            EventRow(event: event)
        }
        .task {
            await viewModel.fetchEvents()
        }
    }
}
```

## Backend API Integration

### API Endpoints Used

**Authentication**:
- POST `/api/auth/signin` - Login
- POST `/api/auth/signout` - Logout

**Events/Schedule**:
- GET `/api/events` - List events
- POST `/api/events` - Create event
- GET `/api/events/[id]` - Get event details
- PATCH `/api/events/[id]` - Update event
- DELETE `/api/events/[id]` - Delete event

**Players/Roster**:
- GET `/api/players` - List players
- POST `/api/players` - Create player
- GET `/api/players/[id]` - Get player details
- PATCH `/api/players/[id]` - Update player
- DELETE `/api/players/[id]` - Delete player

**Tournaments/Travel**:
- GET `/api/tournaments` - List tournaments
- POST `/api/tournaments` - Create tournament
- GET `/api/tournaments/[id]` - Get tournament details
- PATCH `/api/tournaments/[id]` - Update tournament
- DELETE `/api/tournaments/[id]` - Delete tournament
- GET `/api/tournaments/[id]/carpools` - Get carpools
- POST `/api/tournaments/[id]/carpools` - Create carpool
- GET `/api/tournaments/[id]/expenses` - Get expenses
- POST `/api/tournaments/[id]/expenses` - Create expense

**Workouts**:
- GET `/api/workouts` - List workouts
- POST `/api/workouts` - Create workout
- GET `/api/workouts/[id]` - Get workout details
- PATCH `/api/workouts/[id]` - Update workout
- DELETE `/api/workouts/[id]` - Delete workout

### Backend Modifications Needed

1. **CORS Configuration**: Add iOS app domain to allowed origins
2. **JWT Authentication**: Add `/api/auth/token` endpoint for JWT-based login
3. **Error Responses**: Ensure consistent JSON error format
4. **Date Formatting**: Use ISO 8601 format consistently

## UI/UX Design

### Color Scheme

Based on web app:
- Primary: Blue (#1e40af)
- Background: System background
- Surface: System grouped background
- Text: System labels

### Navigation

Tab-based navigation with 5 tabs:
1. Dashboard (Home)
2. Schedule (Calendar)
3. Roster (Players)
4. Travel (Tournaments)
5. More (Settings, Profile, etc.)

### Design Principles

- Native iOS controls and patterns
- SF Symbols for icons
- SwiftUI standard components
- Dark mode support
- Accessibility support (VoiceOver, Dynamic Type)

## Features Roadmap

### Phase 1: Foundation (v1.0)
- ✅ Project structure
- ⏳ Authentication (login/logout)
- ⏳ Dashboard with overview
- ⏳ Schedule with calendar view
- ⏳ Roster with player list
- ⏳ Travel with tournaments
- ⏳ Workouts list

### Phase 2: Core Features (v1.1)
- Event creation/editing
- Player creation/editing
- Tournament creation/editing
- RSVP functionality
- Pull-to-refresh
- Search and filters

### Phase 3: Native Features (v1.2)
- Document upload (camera/photo library)
- Native calendar integration
- Share functionality
- Push notifications setup
- Offline mode basics

### Phase 4: Advanced Features (v1.3)
- Complete offline support
- Background sync
- Face ID/Touch ID
- Widgets
- Apple Watch companion

## Testing Strategy

### Unit Tests
- ViewModel logic
- Service layer methods
- Model transformations

### UI Tests
- Critical user flows
- Login/logout
- Create/edit operations

### Manual Testing
- Physical device testing
- Different iOS versions
- Different screen sizes
- Dark mode
- Accessibility features

## Deployment

### App Store Requirements
- App icons (all sizes)
- Screenshots (all device sizes)
- Privacy policy
- App description and keywords
- Age rating

### Build Configuration
- Debug: Points to development backend
- Release: Points to production backend
- Proper code signing
- TestFlight for beta testing

## Security Considerations

1. **Token Storage**: JWT tokens in Keychain
2. **HTTPS Only**: All API calls over HTTPS
3. **Certificate Pinning**: Consider for production
4. **Input Validation**: All user inputs validated
5. **Secure Data**: No sensitive data in UserDefaults
6. **Biometric Auth**: Face ID/Touch ID for app access (Phase 4)

## Performance Optimization

1. **Image Caching**: Cache player photos
2. **Pagination**: Load events/players in pages
3. **Lazy Loading**: Load data as needed
4. **Background Tasks**: Sync data in background
5. **Memory Management**: Proper cleanup of resources

## Accessibility

1. **VoiceOver**: All UI elements labeled
2. **Dynamic Type**: Support text size changes
3. **High Contrast**: Support high contrast mode
4. **Reduced Motion**: Respect accessibility settings
5. **Color Blind**: Don't rely solely on color

## Next Steps

1. ✅ Create project structure
2. ⏳ Build data models
3. ⏳ Implement networking layer
4. ⏳ Build authentication
5. ⏳ Create main views
6. ⏳ Test and refine
7. ⏳ Prepare for App Store

---

**Last Updated**: December 16, 2024
**Version**: 1.0 (Initial Architecture)
**Status**: In Development
